export enum TokenType {
    // Palavras-chave
    DECLARAR = "DECLARAR",
    IMPRIMIR = "IMPRIMIR",

    // Símbolos
    EQUALS = "EQUALS",
    PLUS = "PLUS",
    MINUS = "MINUS",
    STAR = "STAR",
    SLASH = "SLASH",
    LPAREN = "LPAREN",
    RPAREN = "RPAREN",
    SEMICOLON = "SEMICOLON",

    // Literais e Identificadores
    IDENTIFIER = "IDENTIFIER",
    NUMBER = "NUMBER",

    // Fim do arquivo
    EOF = "EOF",
}

export interface Token {
    type: TokenType;
    value: string; // O texto do token
    line: number;  // A linha onde o token aparece, para mensagens de erro
}