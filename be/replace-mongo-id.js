const fs = require('fs');
const glob = require('glob');

glob.sync('src/**/*.dto.ts').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('IsMongoId')) {
    // Replace IsMongoId decorator
    content = content.replace(/@IsMongoId\(\)/g, '@IsObjectId()');
    content = content.replace(/@IsMongoId\([^)]*\)/g, '@IsObjectId()'); // with args just in case
    
    // Replace IsMongoId import with IsObjectId if it's in class-validator list
    content = content.replace(/IsMongoId\s*,?\s*/g, '');
    
    // Add IsObjectId and Types.ObjectId imports if they don't exist
    if (!content.includes('IsObjectId')) {
      // Find the last import
      const lastImportIndex = content.lastIndexOf('import ');
      const endOfLastImport = content.indexOf('\n', lastImportIndex);
      const importStr = "\nimport { IsObjectId } from 'src/global/is-object-id.decorator';\nimport { Types } from 'mongoose';\n";
      content = content.slice(0, endOfLastImport) + importStr + content.slice(endOfLastImport);
    }
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
