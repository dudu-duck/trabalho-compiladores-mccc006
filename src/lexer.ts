import { Token, TokenType } from "./token";

export class Lexer {
    private readonly source: string;
    private readonly tokens: Token[] = [];
    private start: number = 0;
    private current: number = 0;
    private line: number = 1;

    private static readonly keywords: { [key: string]: TokenType } = {
        declarar: TokenType.DECLARAR,
        imprimir: TokenType.IMPRIMIR,
    };

    constructor(source: string) {
        this.source = source;
    }

    public tokenize(): Token[] {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        // Marca o fim do arquivo
        this.tokens.push({ type: TokenType.EOF, value: "", line: this.line });
        return this.tokens;
    }

    private scanToken(): void {
        const char = this.advance();

        switch (char) {
            // Símbolos de um caractere
            case '(': this.addToken(TokenType.LPAREN); break;
            case ')': this.addToken(TokenType.RPAREN); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '=': this.addToken(TokenType.EQUALS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '*': this.addToken(TokenType.STAR); break;

            case '/':
                // Se o próximo caractere também for uma barra, é um comentário
                if (this.peek() === '/') {
                    while (this.peek() !== '\n' && !this.isAtEnd()) {
                        this.advance();
                    }
                } else {
                    this.addToken(TokenType.SLASH);
                }
                break;

            case ' ':
            case '\r':
            case '\t':
                break;

            case '\n':
                this.line++;
                break;

            default:
                if (this.isDigit(char)) {
                    this.scanNumber();
                } else if (this.isAlpha(char)) {
                    this.scanIdentifier();
                } else {
                    throw new Error(`[Linha ${this.line}] Caractere inesperado: ${char}`);
                }
                break;
        }
    }

    private scanNumber(): void {
        while (this.isDigit(this.peek())) this.advance();

        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            this.advance();
            while (this.isDigit(this.peek())) this.advance();
        }

        this.addToken(TokenType.NUMBER);
    }

    private scanIdentifier(): void {
        while (this.isAlphaNumeric(this.peek())) this.advance();

        const text = this.source.substring(this.start, this.current);

        const type = Lexer.keywords[text] || TokenType.IDENTIFIER;

        this.addToken(type);
    }

    private isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

    private advance(): string {
        return this.source.charAt(this.current++);
    }

    private addToken(type: TokenType): void {
        const text = this.source.substring(this.start, this.current);
        this.tokens.push({ type, value: text, line: this.line });
    }

    private peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.source.charAt(this.current);
    }

    private peekNext(): string {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source.charAt(this.current + 1);
    }

    private isDigit(char: string): boolean {
        return char >= '0' && char <= '9';
    }

    private isAlpha(char: string): boolean {
        return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_';
    }

    private isAlphaNumeric(char: string): boolean {
        return this.isAlpha(char) || this.isDigit(char);
    }
}