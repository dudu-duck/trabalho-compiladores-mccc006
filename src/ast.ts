import { Token } from "./token";

// Interface base para todos os nós da árvore
export type ASTNode =
    | ProgramNode
    | DeclarationNode
    | AssignmentNode
    | PrintNode
    | ExpressionStatementNode
    | BinaryOpNode
    | VariableNode
    | NumberNode;

export interface ProgramNode {
    type: "Program";
    statements: ASTNode[];
}

export interface DeclarationNode {
    type: "Declaration";
    identifier: string;
    expression: ASTNode;
}

export interface AssignmentNode {
    type: "Assignment";
    identifier: string;
    expression: ASTNode;
}

export interface PrintNode {
    type: "Print";
    expression: ASTNode;
}

export interface ExpressionStatementNode {
    type: "ExpressionStatement";
    expression: ASTNode;
}

export interface BinaryOpNode {
    type: "BinaryOp";
    left: ASTNode;
    operator: Token;
    right: ASTNode;
}

export interface VariableNode {
    type: "Variable";
    name: string;
}

export interface NumberNode {
    type: "Number";
    value: number;
}