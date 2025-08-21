import { Token, TokenType } from "./token";
import { ASTNode, ProgramNode, DeclarationNode, PrintNode, ExpressionStatementNode, AssignmentNode, BinaryOpNode, VariableNode, NumberNode } from "./ast";

class ParseError extends Error { }

export class Parser {
    private tokens: Token[];
    private current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    public parse(): ProgramNode {
        const statements: ASTNode[] = [];
        while (!this.isAtEnd()) {
            statements.push(this.statement());
        }
        return { type: "Program", statements };
    }

    private statement(): ASTNode {
        try {
            if (this.match(TokenType.DECLARAR)) return this.declarationStatement();
            if (this.match(TokenType.IMPRIMIR)) return this.printStatement();

            return this.expressionStatement();
        } catch (error) {
            this.synchronize();
            throw error;
        }
    }

    private declarationStatement(): DeclarationNode {
        const name = this.consume(TokenType.IDENTIFIER, "Esperado nome da variável.");
        this.consume(TokenType.EQUALS, "Esperado '=' após o nome da variável.");
        const initializer = this.expression();
        this.consume(TokenType.SEMICOLON, "Esperado ';' após a declaração.");
        return { type: "Declaration", identifier: name.value, expression: initializer };
    }

    private printStatement(): PrintNode {
        this.consume(TokenType.LPAREN, "Esperado '(' após 'imprimir'.");
        const value = this.expression();
        this.consume(TokenType.RPAREN, "Esperado ')' após a expressão.");
        this.consume(TokenType.SEMICOLON, "Esperado ';' após o comando de impressão.");
        return { type: "Print", expression: value };
    }

    private expressionStatement(): ASTNode {
        const expr = this.expression();

        if (this.match(TokenType.EQUALS)) {
            if (expr.type === 'Variable') {
                const value = this.expression();
                this.consume(TokenType.SEMICOLON, "Esperado ';' após a atribuição.");
                return { type: 'Assignment', identifier: expr.name, expression: value };
            }
            throw this.error(this.previous(), "Alvo de atribuição inválido.");
        }

        this.consume(TokenType.SEMICOLON, "Esperado ';' após a expressão.");
        return { type: "ExpressionStatement", expression: expr };
    }

    private expression(): ASTNode {
        return this.term();
    }

    private term(): ASTNode {
        let expr = this.factor();
        while (this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.factor();
            expr = { type: "BinaryOp", left: expr, operator, right };
        }
        return expr;
    }

    private factor(): ASTNode {
        let expr = this.primary();
        while (this.match(TokenType.STAR, TokenType.SLASH)) {
            const operator = this.previous();
            const right = this.primary();
            expr = { type: "BinaryOp", left: expr, operator, right };
        }
        return expr;
    }

    private primary(): ASTNode {
        if (this.match(TokenType.NUMBER)) {
            return { type: "Number", value: parseFloat(this.previous().value) };
        }
        if (this.match(TokenType.IDENTIFIER)) {
            return { type: "Variable", name: this.previous().value };
        }
        if (this.match(TokenType.LPAREN)) {
            const expr = this.expression();
            this.consume(TokenType.RPAREN, "Esperado ')' após a expressão.");
            return expr;
        }

        throw this.error(this.peek(), "Expressão esperada.");
    }

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw this.error(this.peek(), message);
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.peek().type === TokenType.EOF;
    }

    private peek(): Token {
        return this.tokens[this.current]!;
    }

    private previous(): Token {
        return this.tokens[this.current - 1]!;
    }

    private error(token: Token, message: string): ParseError {
        const errorMessage = `[Linha ${token.line}] Erro em '${token.value}': ${message}`;
        console.error(errorMessage);
        return new ParseError(errorMessage);
    }

    private synchronize() {
        this.advance();
        while (!this.isAtEnd()) {
            if (this.previous().type === TokenType.SEMICOLON) return;
            switch (this.peek().type) {
                case TokenType.DECLARAR:
                case TokenType.IMPRIMIR:
                    return;
            }
            this.advance();
        }
    }
}