import fs from 'fs';
import { IActeur } from './IActeur';
import { IQuestion } from './IQuestion';
import * as Eta from 'eta';
import * as path from 'path';
import { asBlob } from 'html-docx-js-typescript';
//import { generatePdf } from 'html-pdf-node-ts';

const __dirname = path.resolve();

const DATA_PATH = './json';
const AUTEURS_PATH = `${DATA_PATH}/acteur`;

class Elu {
    public readonly id: string;
    public readonly nom: string;
    public readonly departement: string;

    public constructor(id: string, source: IActeur) {
        this.id = id;
        this.nom = source.acteur.etatCivil.ident.prenom + ' ' + source.acteur.etatCivil.ident.nom;
        const mandatAN = source.acteur.mandats.mandat.find(m => m.typeOrgane === 'ASSEMBLEE');
        this.departement = mandatAN ? mandatAN.election.lieu.numDepartement : 'N/A';
    }
}

const listeElus:Elu[] =[];

async function lireElu(id: string): Promise<Elu> {
    const valeur = listeElus.find(e => e.id === id);
    if (valeur) {
        return Promise.resolve(valeur);
    } else {
        return new Promise<Elu>((resolve, reject) => {
            fs.promises.readFile(`${AUTEURS_PATH}/${id}.json`).then(data => {
                const srcActeur = JSON.parse(data.toString()) as IActeur;
                const elu = new Elu(id, srcActeur);
                listeElus.push(elu);
                resolve(elu);
            }).catch(err => reject(err));
        });
    }
}

class Question {
    public readonly type: string;
    public readonly id: string;
    public readonly url: string;
    public readonly date: string;
    public readonly auteur: string;
    public readonly dept: string;
    public readonly parti: string;

    public constructor(type: string,id: string, url: string, date: string, auteur: string, dept: string, parti: string) {
        this.type = type;
        this.id = id;
        this.url = url;
        this.date = date;
        this.auteur = auteur;
        this.dept = dept;
        this.parti = parti;
    }

    public static async creeQuestion(type: string, id: string, url: string, date: string, idAuteur: string, groupe: string): Promise<Question> {
        return new Promise<Question>((resolve, reject) => {
            lireElu(idAuteur).then(depute => {
                resolve(new Question(type, id, url, date, depute.nom, depute.departement, groupe));
            }).catch(error => reject(error));
        });
    }
}

class QuestionEcrite extends Question {
    public readonly texteQuestion: string;
    public readonly texteReponse: string;

    public constructor(type: string,id: string, url: string, date: string, 
        auteur: string, dept: string, parti: string, texteQuestion: string, texteReponse: string) {
        super('Question écrite', id, url, date, auteur, dept, parti);
        this.texteQuestion = texteQuestion;
        this.texteReponse = texteReponse;
    }

    public static async cree(id: string, src: IQuestion): Promise<QuestionEcrite> {
        const url = `https://questions.assemblee-nationale.fr/q16/16-${id}QE.htm`;
        const date =  src.question.textesQuestion?.texteQuestion.infoJO.dateJO ?? 'N/A';
        const auteur = src.question.auteur.identite.acteurRef;
        const groupe = src.question.auteur.groupe.abrege;
        const textesQuestion = src.question.textesQuestion; 
        const texteQuestion = textesQuestion?textesQuestion.texteQuestion.texte:'';
        const textesReponse = src.question.textesReponse;
        const texteReponse = textesReponse?textesReponse.texteReponse.texte:'';
        return new Promise<QuestionEcrite>((resolve, reject) => {
            lireElu(auteur).then(depute => {
                resolve(new QuestionEcrite('Question écrite', id, url, date, depute.nom, depute.departement, groupe, texteQuestion, texteReponse));
            }).catch(error => reject(error));
        });
    }
}

class QuestionGouvernement extends Question {
    public readonly texte: string;

    public constructor(type: string,id: string, url: string, date: string, 
        auteur: string, dept: string, parti: string, texte: string) {
        super('Question écrite', id, url, date, auteur, dept, parti);
        this.texte = texte;
    }

    public static async cree(id: string, src: IQuestion): Promise<QuestionGouvernement> {
        const url = `https://questions.assemblee-nationale.fr/q16/16-${id}QG.htm`;
        const date =  src.question.cloture?.dateCloture ?? 'N/A';
        const auteur = src.question.auteur.identite.acteurRef;
        const groupe = src.question.auteur.groupe.abrege;
        const textesReponse = src.question.textesReponse;
        const texte = textesReponse?textesReponse.texteReponse.texte:'';
        return new Promise<QuestionGouvernement>((resolve, reject) => {
            lireElu(auteur).then(depute => {
                resolve(new QuestionGouvernement('Question au gouvernement', id, url, date, depute.nom, depute.departement, groupe, texte));
            }).catch(error => reject(error));
        });
    }
}

interface Donnees {
    questionsEcrites: QuestionEcrite[],
    questionsGouvernement: QuestionGouvernement[]
}

const donnees: Donnees = {
    questionsEcrites: [],
    questionsGouvernement: []
}

function extraitId(file: string, prefix: string): string {
    const debutId = file.indexOf(prefix);
    const finId = file.indexOf('.json');
    return file.substring(debutId + prefix.length, finId);
}

function traitementQuestionEcrite(file: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        const id = extraitId(file, 'QE');
        fs.promises.readFile(`${DATA_PATH}/${file}`).then(data => {
            const sourceData = JSON.parse(data.toString()) as IQuestion;
            QuestionEcrite.cree(id, sourceData).then(question => {
                donnees.questionsEcrites.push(question);
                resolve(true);
            }).catch(err => reject(err));
        }).catch(err => reject(err));
    })
}

function traitementQuestionGouvernement(file: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        const id = extraitId(file, 'QG');
        fs.promises.readFile(`${DATA_PATH}/${file}`).then(data => {
            const sourceData = JSON.parse(data.toString()) as IQuestion;
            QuestionGouvernement.cree(id, sourceData).then(question => {
                donnees.questionsGouvernement.push(question);
                resolve(true);
            }).catch(err => reject(err));
        }).catch(err => reject(err));
    })
}

function genereTraitement(file: string): Promise<boolean> {
    if (file.includes('QE')) {
        // tester s'il faut garder la question écrite
        return traitementQuestionEcrite(file);
    } else if (file.includes('QG')) {
        // tester s'il faut garder la question écrite
        return traitementQuestionGouvernement(file);
    } else {
        console.log(`Ignore le fichier ${file}`);
        return Promise.resolve(true);
    }
}

function renderAndOutput(fileName: string, data: Donnees): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const renderer = Eta.renderFile(`${__dirname}/layout/layout.eta`, data) as Promise<string>;
        renderer.then(output => {
            fs.promises.writeFile(`./resultat/${fileName}.html`, output).then(_ => console.log(`Fichier ${fileName}.html écrit`)).catch(err => console.error(err));
            asBlob(output).then(fileBuf => {
                const buffer = fileBuf as Buffer;
                fs.promises.writeFile(`./resultat/${fileName}.docx`, buffer).then(_ => console.log(`Fichier ${fileName}.docx écrit`)).catch(err => console.error(err));
            }).catch((err: any) => console.error(err));
        }).catch(err => console.error(err));
        resolve(true);
    });
}

fs.promises.readdir('./json').then(files => {
    const traitements = files.map(f => genereTraitement(f));
    Promise.all(traitements).then(resultats => {
        renderAndOutput('toutes', donnees);
        const SEARCH_IEF = 'instruction en famille';
        const ief: Donnees = {
            questionsEcrites: donnees.questionsEcrites.filter(q => (q.texteQuestion.indexOf(SEARCH_IEF) !== -1) || (q.texteReponse.indexOf(SEARCH_IEF) !== -1)),
            questionsGouvernement: donnees.questionsGouvernement.filter(q => q.texte.indexOf(SEARCH_IEF) !== -1)
        };
        renderAndOutput('ief', ief);
    }).catch(err => console.error(err));
});
