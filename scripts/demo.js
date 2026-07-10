import { spawn } from 'node:child_process';

const sections = [
  [
    '1/2 Reproduce the preserved read leak',
    ['--test', '--test-reporter=spec', 'test/broken-baseline.test.js']
  ],
  [
    '2/2 Verify hardened read and write isolation',
    [
      '--test',
      '--test-reporter=spec',
      'test/rescued-tenant-isolation.test.js',
      'test/rescued-write-matrix.test.js'
    ]
  ]
];

for (const [label, arguments_] of sections) {
  console.log(`\n=== ${label} ===`);

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, arguments_, {
      stdio: 'inherit',
      shell: false
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Evidence section exited with code ${code}`));
      }
    });
  });
}

console.log('\nDEMO COMPLETE: baseline reproduced; hardened invariants passed.');
