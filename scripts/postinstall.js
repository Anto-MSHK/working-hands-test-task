const fs = require('fs');
const path = require('path');

function fixScreens() {
  const file = path.join(__dirname, '..', 'node_modules', 'react-native-screens', 'android', 'build.gradle');
  
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('// CMake fix')) return;
  
  content = content.replace(
    /(\s+)externalNativeBuild\s*\{\s*\n\s*cmake\s*\{\s*\n\s*arguments\s+"[^"]*",?\s*\n\s*"[^"]*",?\s*\n\s*"[^"]*"\s*\n\s*\}\s*\n\s*\}/gm,
    '$1// CMake fix\n$1// externalNativeBuild { cmake { arguments "-DANDROID_STL=c++_shared", "-DRNS_NEW_ARCH_ENABLED=${IS_NEW_ARCHITECTURE_ENABLED}", "-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON" } }'
  );
  
  content = content.replace(
    /(\s+)externalNativeBuild\s*\{\s*\n\s*cmake\s*\{\s*\n\s*path\s+"CMakeLists\.txt"\s*\n\s*\}\s*\n\s*\}/gm,
    '$1// CMake fix\n$1// externalNativeBuild { cmake { path "CMakeLists.txt" } }'
  );
  
  fs.writeFileSync(file, content);
}

fixScreens();

if (process.platform === 'darwin') {
  console.log('Run: cd ios && pod install');
}

