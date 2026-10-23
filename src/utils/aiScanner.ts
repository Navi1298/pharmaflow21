import { TableRow, AIFixItem } from '../types';

// Common pharma / manufacturing dictionary of typos and standardized corrections
const PHARMA_SPELLING_DICTIONARY: Record<string, string> = {
  pencillin: 'Penicillin',
  penicilin: 'Penicillin',
  acetominophen: 'Acetaminophen',
  paracetemol: 'Paracetamol',
  ibuprofin: 'Ibuprofen',
  amoxicilin: 'Amoxicillin',
  temparature: 'Temperature',
  temperture: 'Temperature',
  miligrams: 'Milligrams',
  miligram: 'Milligram',
  autoclavee: 'Autoclave',
  calibaration: 'Calibration',
  calibraton: 'Calibration',
  presure: 'Pressure',
  solusion: 'Solution',
  steril: 'Sterile',
  disolusion: 'Dissolution',
  pharamaceutical: 'Pharmaceutical',
  concentrasion: 'Concentration',
  viscocity: 'Viscosity',
  injecshun: 'Injection',
  lyophilzed: 'Lyophilized',
  lyophilised: 'Lyophilized',
  ampule: 'Ampoule',
  stablity: 'Stability',
  devisation: 'Deviation',
  sterilization: 'Sterilization',
};

/**
 * Normalizes a full name into Title Case standard format
 */
export function standardizeName(name: string): string {
  if (!name) return name;
  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formats raw digits into standard international pharma contact format: +1 (XXX) XXX-XXXX
 */
export function standardizePhone(phone: string): { formatted: string; isValid: boolean } {
  if (!phone) return { formatted: '', isValid: false };
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return {
      formatted: `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`,
      isValid: true,
    };
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return {
      formatted: `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`,
      isValid: true,
    };
  }
  
  return { formatted: phone, isValid: digits.length >= 7 };
}

/**
 * Scans a dataset using rule-based and linguistic AI heuristics
 */
export function scanTableData(rows: TableRow[]): AIFixItem[] {
  const fixes: AIFixItem[] = [];

  rows.forEach((row) => {
    // 1. Scan Name Column
    if (row.name) {
      const trimmed = row.name.trim();
      const standard = standardizeName(trimmed);

      // Check for capitalization inconsistency
      if (trimmed !== standard && trimmed.length > 1) {
        fixes.push({
          id: `fix-${row.id}-name-cap`,
          rowId: row.id,
          columnKey: 'name',
          originalValue: row.name,
          suggestedValue: standard,
          issueType: 'CAPITALIZATION',
          explanation: `Inconsistent capitalization detected in subject name "${row.name}". Standardized to Title Case format "${standard}" per GMP nomenclature rules.`,
          severity: 'FORMAT',
          status: 'PENDING',
        });
      }

      // Check for typos in name words
      const words = trimmed.toLowerCase().split(/\s+/);
      words.forEach((w) => {
        if (PHARMA_SPELLING_DICTIONARY[w]) {
          fixes.push({
            id: `fix-${row.id}-name-typo-${w}`,
            rowId: row.id,
            columnKey: 'name',
            originalValue: row.name,
            suggestedValue: row.name.replace(new RegExp(w, 'gi'), PHARMA_SPELLING_DICTIONARY[w]),
            issueType: 'TYPO',
            explanation: `Typographical error detected in name term "${w}". Corrected to official standard "${PHARMA_SPELLING_DICTIONARY[w]}".`,
            severity: 'MAJOR',
            status: 'PENDING',
          });
        }
      });
    }

    // 2. Scan Phone Column
    if (row.phone) {
      const rawPhone = String(row.phone).trim();
      const { formatted, isValid } = standardizePhone(rawPhone);

      if (rawPhone !== formatted && isValid) {
        fixes.push({
          id: `fix-${row.id}-phone-fmt`,
          rowId: row.id,
          columnKey: 'phone',
          originalValue: row.phone,
          suggestedValue: formatted,
          issueType: 'PHONE_FORMAT',
          explanation: `Non-standard contact phone format "${rawPhone}". Re-formatted to GAMP standardized telephone notation "${formatted}".`,
          severity: 'FORMAT',
          status: 'PENDING',
        });
      } else if (!isValid && rawPhone.length > 0) {
        fixes.push({
          id: `fix-${row.id}-phone-invalid`,
          rowId: row.id,
          columnKey: 'phone',
          originalValue: row.phone,
          suggestedValue: '+1 (555) 000-0000',
          issueType: 'MISSING_DATA',
          explanation: `Incomplete telephone number digits ("${rawPhone}"). Requires verification or standard placeholder.`,
          severity: 'MAJOR',
          status: 'PENDING',
        });
      }
    }

    // 3. Scan Age / Numeric Column
    if (row.age !== undefined && row.age !== '') {
      const numAge = Number(row.age);
      if (isNaN(numAge) || numAge <= 0 || numAge > 120) {
        fixes.push({
          id: `fix-${row.id}-age-range`,
          rowId: row.id,
          columnKey: 'age',
          originalValue: row.age,
          suggestedValue: Math.max(18, Math.min(65, isNaN(numAge) ? 35 : numAge)),
          issueType: 'RANGE_ANOMALY',
          explanation: `Biological age value "${row.age}" is outside valid clinical cohort parameters (1-120). Suggested default baseline or requires manual verification.`,
          severity: 'CRITICAL',
          status: 'PENDING',
        });
      }
    }

    // 4. Scan Notes & Parameter fields for spelling mistakes
    const textFieldsToCheck: Array<{ key: string; val: string | undefined }> = [
      { key: 'notes', val: row.notes },
      { key: 'parameter', val: row.parameter },
    ];

    textFieldsToCheck.forEach(({ key, val }) => {
      if (val) {
        let correctedText = val;
        let foundTypo = false;
        let typoExplanation = '';

        Object.entries(PHARMA_SPELLING_DICTIONARY).forEach(([typo, correct]) => {
          const regex = new RegExp(`\\b${typo}\\b`, 'gi');
          if (regex.test(correctedText)) {
            correctedText = correctedText.replace(regex, correct);
            foundTypo = true;
            typoExplanation += `Found misspelled term "${typo}" -> replaced with "${correct}". `;
          }
        });

        if (foundTypo) {
          fixes.push({
            id: `fix-${row.id}-${key}-typo`,
            rowId: row.id,
            columnKey: key,
            originalValue: val,
            suggestedValue: correctedText,
            issueType: 'TYPO',
            explanation: `Typographical error in ${key}: ${typoExplanation}`,
            severity: 'MAJOR',
            status: 'PENDING',
          });
        }
      }
    });

    // 5. Scan Parameter Min/Max Limits
    if (row.reading !== undefined && row.minLimit !== undefined && row.maxLimit !== undefined) {
      const readVal = Number(row.reading);
      const minVal = Number(row.minLimit);
      const maxVal = Number(row.maxLimit);

      if (!isNaN(readVal) && !isNaN(minVal) && !isNaN(maxVal)) {
        if (readVal < minVal || readVal > maxVal) {
          fixes.push({
            id: `fix-${row.id}-reading-out-of-range`,
            rowId: row.id,
            columnKey: 'reading',
            originalValue: row.reading,
            suggestedValue: readVal < minVal ? minVal : maxVal,
            issueType: 'RANGE_ANOMALY',
            explanation: `Parameter reading (${readVal}) breaches GMP specification tolerance [${minVal} - ${maxVal}]. Flagged for deviation report.`,
            severity: 'CRITICAL',
            status: 'PENDING',
          });
        }
      }
    }
  });

  return fixes;
}
