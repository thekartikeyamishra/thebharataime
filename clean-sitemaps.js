const fs = require('fs');
const path = require('path');

// Target the public directory where the XML files are served
const PUBLIC_DIR = path.join(__dirname, 'public');

// List of sitemaps to process (sitemap-index.xml is intentionally excluded)
const sitemapsToClean = [
  'sitemap.xml',
  'sitemap-cities.xml',
  'sitemap-hi.xml',
  'sitemap-programmatic.xml',
  'sitemap-schemes.xml',
  'sitemap-states.xml'
];

console.log(`\n🔍 Starting sitemap deduplication in: ${PUBLIC_DIR}\n`);

sitemapsToClean.forEach(fileName => {
  const filePath = path.join(PUBLIC_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Skipped: ${fileName} (File not found)`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract the content inside <urlset> ... </urlset>
    const urlsetRegex = /(<urlset[^>]*>)([\s\S]*?)(<\/urlset>)/i;
    const match = content.match(urlsetRegex);

    if (!match) {
      console.warn(`⚠️  Skipped: ${fileName} (No <urlset> found)`);
      return;
    }

    const header = match[1];
    const body = match[2];
    const footer = match[3];

    // Split into individual <url> blocks
    const urlBlocks = body.split('</url>');
    const uniqueUrls = new Set();
    const cleanedBlocks = [];
    let originalCount = 0;

    urlBlocks.forEach(block => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return;

      originalCount++;

      // Re-add the closing tag for parsing/rebuilding
      const fullBlock = trimmedBlock + '\n  </url>';

      // Extract the <loc> value to check for uniqueness
      const locMatch = fullBlock.match(/<loc>(.*?)<\/loc>/);
      
      if (locMatch && locMatch[1]) {
        const locUrl = locMatch[1].trim();
        
        if (!uniqueUrls.has(locUrl)) {
          uniqueUrls.add(locUrl);
          
          // Clean up internal indentation of the <url> block
          const formattedBlock = fullBlock.split('\n').map((line, index) => {
            return index === 0 ? line : `  ${line.trimLeft()}`;
          }).join('\n');

          cleanedBlocks.push(`  ${formattedBlock}`);
        }
      }
    });

    const newCount = uniqueUrls.size;

    if (originalCount === newCount) {
      console.log(`✅ ${fileName}: Already clean (${newCount} unique URLs).`);
      return;
    }

    // Preserve the original XML declaration
    const xmlDeclarationMatch = content.match(/^<\?xml.*?\?>\n?/i);
    const xmlDeclaration = xmlDeclarationMatch ? xmlDeclarationMatch[0] : '<?xml version="1.0" encoding="UTF-8"?>\n';

    // Reassemble the XML
    const newXmlContent = `${xmlDeclaration}${header}\n${cleanedBlocks.join('\n')}\n${footer}\n`;

    fs.writeFileSync(filePath, newXmlContent, 'utf8');
    
    const removedCount = originalCount - newCount;
    console.log(`✅ ${fileName}: Cleaned! Removed ${removedCount} duplicates. (Final count: ${newCount} URLs)`);

  } catch (error) {
    console.error(`❌ Error processing ${fileName}:`, error.message);
  }
});

console.log('\n🎉 Sitemap deduplication complete.\n');