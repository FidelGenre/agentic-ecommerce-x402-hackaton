const fs = require('fs')
const path = require('path')

const targetFile = 'c:\\Program\\agentic commerce x402 hackaton\\agent-shop\\src\\app\\dashboard\\page.tsx'

try {
    const content = fs.readFileSync(targetFile, 'utf8')
    const lines = content.split('\n')

    // Safety check: is line 528 containing the broken line?
    if (!lines[527].includes('onClick={() => handleDownloadReceipt(receipt)}')) {
        console.error('Line 528 mismatch! Not proceeding with receipt handler safe check.')
        // We will proceed with Agent Modal fix regardless, or abort?
        // Let's abort to be safe and re-verify.
        // Actually, line numbers might shift if previous edit failed partially.
    } else {
        // Fix line 528 (index 527)
        lines[527] = lines[527].replace('onClick={() => handleDownloadReceipt(receipt)}', 'onClick={() => receipt && handleDownloadReceipt(receipt)}')
        console.log('Fixed receipt handler safety check.')
    }

    // Agent Modal Fix: Remove lines 573-595 (indices 572-594) and replace with button
    // Safety check first
    if (lines[572].includes('grid grid-cols-3') && lines[594].includes('</div>')) {
        // Replace 572 with button code
        lines[572] = '                                <button onClick={handleAddAgentFinal} className="w-full py-5 bg-purple-600 rounded-2xl font-black uppercase">Initialize Agent</button>'
        // Clear 573 to 594
        for (let i = 573; i <= 594; i++) {
            lines[i] = ''
        }
        // We can just filter out empty lines later or just leave them blank?
        // Leaving blank is safer to avoid shifting line numbers if we had more edits.
        // But we want to remove them.
        // Let's splice them out. Careful with indices.
        // Index 572 is replaced. Indices 573 to 594 (inclusive) are removed.
        const numToRemove = 594 - 573 + 1 // 22 lines
        lines.splice(573, numToRemove)
        console.log('Removed duplicate receipt block from Agent Modal.')
    } else {
        console.error('Agent Modal block mismatch! Found:', lines[572])
    }

    fs.writeFileSync(targetFile, lines.join('\n'))
    console.log('Success!')
} catch (e) {
    console.error(e)
}
