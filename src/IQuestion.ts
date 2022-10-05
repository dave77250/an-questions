export interface Identifiant {
    numero: string;
    regime: string;
    legislature: string;
}

export interface ANALYSE {
    ANA: string;
}

export interface IndexationAN {
    rubrique: string;
    teteAnalyse?: any;
    ANALYSE: ANALYSE;
}

export interface Identite {
    acteurRef: string;
    mandatRef: string;
}

export interface Groupe {
    organeRef: string;
    abrege: string;
    developpe: string;
}

export interface Auteur {
    identite: Identite;
    groupe: Groupe;
}

export interface MinInt {
    abrege: string;
    developpe: string;
}

export interface Denomination {
    abrege: string;
    developpe: string;
}

export interface MinAttrib {
    denomination: Denomination;
}

export interface MinAttribs {
    minAttrib: MinAttrib;
}

export interface InfoJO {
    typeJO: string;
    dateJO: string;
}

export interface TexteQuestion {
    infoJO: InfoJO;
    texte: string;
}

export interface TextesQuestion {
    texteQuestion: TexteQuestion;
}

export interface TexteReponse {
    infoJO: InfoJO;
    texte: string;
}

export interface TextesReponse {
    texteReponse: TexteReponse;
}

export interface InfoJO2 {
    typeJO: string;
    dateJO: string;
    pageJO: string;
}

export interface Cloture {
    codeCloture: string;
    libelleCloture: string;
    dateCloture: string;
    infoJO: InfoJO2;
}
// pour question ecrite, chercher la date dans la question
// pour question au gouvernement, chercher la date dans cloture
export interface Question {
    uid: string;
    identifiant: Identifiant;
    type: string; // QE pour question ecrite, QG pour question au gouvernement
    indexationAN: IndexationAN;
    auteur: Auteur;
    minInt: MinInt;
    minAttribs: MinAttribs;
    textesQuestion?: TextesQuestion; // null pour question au gouvernement
    textesReponse?: TextesReponse; // peut être null pour question ecrite
    cloture?: Cloture;
    signalement?: any;
    renouvellements?: any;
}

export interface IQuestion {
    question: Question;
}
