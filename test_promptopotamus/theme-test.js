const puppeteer = require('puppeteer');

async function analyzeThemeConsistency() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  
  const pages = [
    { name: 'Tools', url: 'http://localhost:3000/tools' },
    { name: 'Guides', url: 'http://localhost:3000/guides' },
    { name: 'Templates', url: 'http://localhost:3000/templates' },
    { name: 'Resources', url: 'http://localhost:3000/resources' }
  ];

  const results = {};
  
  for (const pageInfo of pages) {
    console.log(`\n=== Analyzing ${pageInfo.name} Page ===`);
    
    const page = await browser.newPage();
    
    try {
      await page.goto(pageInfo.url, { waitUntil: 'networkidle0', timeout: 10000 });
      
      // Wait a moment for any dynamic content to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Take screenshot
      await page.screenshot({ 
        path: `./screenshots/${pageInfo.name.toLowerCase()}-page.png`,
        fullPage: true 
      });
      
      // Analyze theme elements
      const themeAnalysis = await page.evaluate(() => {
        // Get computed styles for key elements
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        const pageContent = document.querySelector('.page-content');
        const cards = document.querySelectorAll('.card');
        const pageHeader = document.querySelector('.page-header');
        
        const getComputedStyle = (element) => {
          if (!element) return null;
          const styles = window.getComputedStyle(element);
          return {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            borderColor: styles.borderColor
          };
        };
        
        return {
          sidebar: getComputedStyle(sidebar),
          mainContent: getComputedStyle(mainContent),
          pageContent: getComputedStyle(pageContent),
          pageHeader: getComputedStyle(pageHeader),
          cardCount: cards.length,
          firstCard: cards.length > 0 ? getComputedStyle(cards[0]) : null,
          bodyClass: document.body.className,
          hasWhitespace: window.innerWidth > (document.querySelector('.page-content')?.offsetWidth + 256 + 100) // sidebar + buffer
        };
      });
      
      results[pageInfo.name] = themeAnalysis;
      
      console.log(`${pageInfo.name} Analysis:`);
      console.log(`- Sidebar BG: ${themeAnalysis.sidebar?.backgroundColor}`);
      console.log(`- Main Content BG: ${themeAnalysis.mainContent?.backgroundColor}`);
      console.log(`- Page Header BG: ${themeAnalysis.pageHeader?.backgroundColor}`);
      console.log(`- Card Count: ${themeAnalysis.cardCount}`);
      console.log(`- First Card BG: ${themeAnalysis.firstCard?.backgroundColor}`);
      console.log(`- Has Excessive Whitespace: ${themeAnalysis.hasWhitespace}`);
      
    } catch (error) {
      console.error(`Error analyzing ${pageInfo.name}:`, error.message);
      results[pageInfo.name] = { error: error.message };
    } finally {
      await page.close();
    }
  }
  
  // Compare themes for inconsistencies
  console.log('\n=== THEME CONSISTENCY REPORT ===');
  
  const pageNames = Object.keys(results);
  const inconsistencies = [];
  
  // Check sidebar consistency
  const sidebarBGs = pageNames.map(name => results[name].sidebar?.backgroundColor).filter(Boolean);
  if (new Set(sidebarBGs).size > 1) {
    inconsistencies.push(`Sidebar backgrounds vary: ${JSON.stringify([...new Set(sidebarBGs)])}`);
  }
  
  // Check main content consistency  
  const mainBGs = pageNames.map(name => results[name].mainContent?.backgroundColor).filter(Boolean);
  if (new Set(mainBGs).size > 1) {
    inconsistencies.push(`Main content backgrounds vary: ${JSON.stringify([...new Set(mainBGs)])}`);
  }
  
  // Check header consistency
  const headerBGs = pageNames.map(name => results[name].pageHeader?.backgroundColor).filter(Boolean);
  if (new Set(headerBGs).size > 1) {
    inconsistencies.push(`Page header backgrounds vary: ${JSON.stringify([...new Set(headerBGs)])}`);
  }
  
  // Check card consistency
  const cardBGs = pageNames.map(name => results[name].firstCard?.backgroundColor).filter(Boolean);
  if (new Set(cardBGs).size > 1) {
    inconsistencies.push(`Card backgrounds vary: ${JSON.stringify([...new Set(cardBGs)])}`);
  }
  
  // Check whitespace issues
  const whitespaceIssues = pageNames.filter(name => results[name].hasWhitespace);
  if (whitespaceIssues.length > 0) {
    inconsistencies.push(`Pages with excessive whitespace: ${whitespaceIssues.join(', ')}`);
  }
  
  if (inconsistencies.length === 0) {
    console.log('✅ All pages have consistent themes!');
  } else {
    console.log('❌ Theme inconsistencies found:');
    inconsistencies.forEach(issue => console.log(`  - ${issue}`));
  }
  
  await browser.close();
  return results;
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('./screenshots')) {
  fs.mkdirSync('./screenshots');
}

// Run the analysis
analyzeThemeConsistency()
  .then(results => {
    console.log('\n=== Analysis Complete ===');
    // Write detailed results to file
    fs.writeFileSync('./theme-analysis-results.json', JSON.stringify(results, null, 2));
    console.log('Detailed results saved to theme-analysis-results.json');
    console.log('Screenshots saved to ./screenshots/ directory');
  })
  .catch(console.error);