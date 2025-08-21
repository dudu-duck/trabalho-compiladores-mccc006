import * as fs from 'fs';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Interpreter } from './interpreter';

function main() {
    const args = process.argv.slice(2);

    if (args.length !== 1) {
        console.log("Uso: npx ts-node src/main.ts [arquivo]");
        process.exit(64);
    }

    const filePath = args[0];
    runFile(filePath!);
}

function runFile(filePath: string) {
    console.log(`Executando o arquivo: ${filePath}`);

    try {
        const sourceCode = fs.readFileSync(filePath, 'utf-8');

        const lexer = new Lexer(sourceCode);
        const tokens = lexer.tokenize();

        const parser = new Parser(tokens);
        const ast = parser.parse();

        const interpreter = new Interpreter();
        interpreter.run(ast);

    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.error(`Erro: Não foi possível encontrar o arquivo '${filePath}'`);
        } else {
            // Erros de parsing ou de runtime imprimem suas próprias mensagens.
            console.error("A execução falhou.");
        }
        process.exit(74);
    }
    console.log("Execução finalizada com sucesso.");
}

main();