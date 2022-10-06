export interface Uid {
}

export interface Ident {
    civ: string;
    prenom: string;
    nom: string;
    alpha: string;
    trigramme: string;
}

export interface InfoNaissance {
    dateNais: string;
    villeNais: string;
    depNais: string;
    paysNais: string;
}

export interface DateDeces {
}

export interface EtatCivil {
    ident: Ident;
    infoNaissance: InfoNaissance;
    dateDeces: DateDeces;
}

export interface SocProcINSEE {
    catSocPro: string;
    famSocPro: string;
}

export interface Profession {
    libelleCourant: string;
    socProcINSEE: SocProcINSEE;
}

export interface Adresse {
    uid: string;
    type: string;
    typeLibelle: string;
    poids: string;
    adresseDeRattachement: string;
    intitule: string;
    numeroRue: string;
    nomRue: string;
    complementAdresse?: any;
    codePostal: string;
    ville: string;
    valElec: string;
}

export interface Adresses {
    adresse: Adresse[];
}

export interface InfosQualite {
    codeQualite: string;
    libQualite: string;
    libQualiteSex: string;
}

export interface Organes {
    organeRef: string;
}

export interface Suppleant {
    dateDebut: string;
    dateFin?: any;
    suppleantRef: string;
}

export interface Suppleants {
    suppleant: Suppleant;
}

export interface Lieu {
    region: string;
    regionType: string;
    departement: string;
    numDepartement: string;
    numCirco: string;
}

export interface Election {
    lieu: Lieu;
    causeMandat: string;
    refCirconscription: string;
}

export interface Mandature {
    datePriseFonction: string;
    causeFin?: any;
    premiereElection: string;
    placeHemicycle: string;
    mandatRemplaceRef?: any;
}

export interface Collaborateur {
    qualite: string;
    prenom: string;
    nom: string;
    dateDebut?: any;
    dateFin?: any;
}

export interface Collaborateurs {
    collaborateur: Collaborateur[];
}

export interface Mandat {
    uid: string;
    acteurRef: string;
    legislature: string;
    typeOrgane: string;
    dateDebut: string;
    datePublication: string;
    dateFin: string;
    preseance: string;
    nominPrincipale: string;
    infosQualite: InfosQualite;
    organes: Organes;
    suppleants: Suppleants;
    chambre?: any;
    election: Election;
    mandature: Mandature;
    collaborateurs: Collaborateurs;
}

export interface Mandats {
    mandat: Mandat[];
}

export interface Acteur {
    uid: Uid;
    etatCivil: EtatCivil;
    profession: Profession;
    uri_hatvp: string;
    adresses: Adresses;
    mandats: Mandats;
}

export interface IActeur {
    acteur: Acteur;
}

