import { ASTNode, ProgramNode, DeclarationNode, PrintNode, AssignmentNode, ExpressionStatementNode, BinaryOpNode, VariableNode, NumberNode } from './ast';
import { TokenType } from './token';

// Erros de esecução
class RuntimeError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class Interpreter {
    // Tabela de símbolos
    private memory: Map<string, number> = new Map();

    // Método que inicia a execução da AST
    public run(program: ProgramNode): void {
        try {
            for (const statement of program.statements) {
                this.execute(statement);
            }
        } catch (error) {
            console.error((error as Error).message);
        }
    }

    // Execução de comandos
    private execute(statement: ASTNode): void {
        switch (statement.type) {
            case 'Declaration':
                return this.visitDeclaration(statement);
            case 'Print':
                return this.visitPrint(statement);
            case 'Assignment':
                return this.visitAssignment(statement);
            case 'ExpressionStatement':
                this.evaluate(statement.expression);
                return;
        }
    }

    private visitDeclaration(stmt: DeclarationNode): void {
        const value = this.evaluate(stmt.expression);
        if (this.memory.has(stmt.identifier)) {
            throw new RuntimeError(`Erro: Variável '${stmt.identifier}' já foi declarada.`);
        }
        this.memory.set(stmt.identifier, value);
    }

    private visitAssignment(stmt: AssignmentNode): void {
        if (!this.memory.has(stmt.identifier)) {
            throw new RuntimeError(`Erro: Variável '${stmt.identifier}' não foi declarada.`);
        }
        const value = this.evaluate(stmt.expression);
        this.memory.set(stmt.identifier, value);
    }

    private visitPrint(stmt: PrintNode): void {
        const value = this.evaluate(stmt.expression);
        console.log(value);
    }

    // --- Cáculos
    private evaluate(expr: ASTNode): number {
        switch (expr.type) {
            case 'Number':
                return expr.value;
            case 'Variable':
                return this.visitVariable(expr);
            case 'BinaryOp':
                return this.visitBinaryOp(expr);
        }
        throw new RuntimeError("Expressão inválida.");
    }

    private visitVariable(expr: VariableNode): number {
        if (this.memory.has(expr.name)) {
            return this.memory.get(expr.name)!;
        }
        throw new RuntimeError(`Erro: Variável '${expr.name}' não foi declarada.`);
    }

    private visitBinaryOp(expr: BinaryOpNode): number {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.PLUS:
                return left + right;
            case TokenType.MINUS:
                return left - right;
            case TokenType.STAR:
                return left * right;
            case TokenType.SLASH:
                if (right === 0) {
                    throw new RuntimeError("Erro: Divisão por zero.");
                }
                return left / right;
        }
        throw new RuntimeError("Operador binário desconhecido.");
    }
}