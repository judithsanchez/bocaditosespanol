const fs = require('fs');
const path = require('path');

const cjsPackageJsonPath = path.join(
	__dirname,
	'..',
	'dist',
	'cjs',
	'package.json',
);
const content = {type: 'commonjs'};
fs.writeFileSync(cjsPackageJsonPath, JSON.stringify(content, null, 2));
