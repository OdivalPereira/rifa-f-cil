/**
 * Utility to generate a static PIX Copy and Paste (BRCode) payload.
 * Based on EMV QRCPS Merchant-Presented Mode specifications.
 */

interface PixPayloadOptions {
    key: string;
    amount: number;
    beneficiaryName: string;
    city?: string;
    description?: string;
    txId?: string;
}

function leftPad(value: string | number, length: number): string {
    return String(value).padStart(length, '0');
}

function formatTag(id: string, value: string): string {
    return id + leftPad(value.length, 2) + value;
}

function calculateCRC16(payload: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

export function generatePixPayload({
    key,
    amount,
    beneficiaryName,
    city = 'SAO PAULO',
    description = '',
    txId = '***',
}: PixPayloadOptions): string {
    // 00 - Payload Format Indicator
    let payload = formatTag('00', '01');

    // 26 - Merchant Account Information (GUI + Key + Description)
    const gui = formatTag('00', 'br.gov.bcb.pix');
    const keyTag = formatTag('01', key);
    const infoTag = description ? formatTag('02', description.substring(0, 40)) : '';
    payload += formatTag('26', gui + keyTag + infoTag);

    // 52 - Merchant Category Code
    payload += formatTag('52', '0000');

    // 53 - Transaction Currency (BRL = 986)
    payload += formatTag('53', '986');

    // 54 - Transaction Amount
    payload += formatTag('54', amount.toFixed(2));

    // 58 - Country Code
    payload += formatTag('58', 'BR');

    // 59 - Merchant Name
    payload += formatTag('59', beneficiaryName.substring(0, 25).toUpperCase());

    // 60 - Merchant City
    payload += formatTag('60', city.substring(0, 15).toUpperCase());

    // 62 - Additional Data Field Template (txId)
    const txTag = formatTag('05', txId === '***' ? '***' : txId.substring(0, 25));
    payload += formatTag('62', txTag);

    // 63 - CRC16 (Initiate tag, calculate on total payload + '6304')
    payload += '6304';
    payload += calculateCRC16(payload);

    return payload;
}
