import fs from 'fs';
import solc from 'solc';

const source = fs.readFileSync('src/contracts/Voting.sol', 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'Voting.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi'],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
    output.errors.forEach(err => console.error(err.formattedMessage));
    if (output.errors.some(e => e.severity === 'error')) {
        process.exit(1);
    }
}

const abi = output.contracts['Voting.sol'].Voting.abi;

const fileContent = `export const CONTRACT_ABI = ${JSON.stringify(abi, null, 2)};`;
fs.writeFileSync('src/utils/ABI.js', fileContent);
console.log('ABI generated successfully in src/utils/ABI.js!');
