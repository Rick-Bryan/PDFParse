import fs from "fs";
import { PdfReader } from "pdfreader";
import { PDFDocument } from 'pdf-lib';
import moment from "moment";
import { saveLog } from './logs/logger.js';

let dataAtual = moment().format('DD_MM_YYYY')
let horaAtual = moment().format('HH_mm_ss')

export default function parser(cpf) {

    //Variáveis
    let currentPage = 0;
    let rows = {};
    let rowArray = []
    let filename = 'funcionarios/COMPROVANTE DE RENDIMENTO CES VIGILANCIA 2022.pdf';

    function flushRows() {
        Object.keys(rows)
            .sort((y1, y2) => parseFloat(y1) - parseFloat(y2))
            .forEach((y) => {
                const rowText = (rows[y] || []).join('');
                rowArray = (rows[y] || []).join('');
                if (rowText.includes(cpf)) {
                    
                        console.log(`Found cpf : ${cpf} on page ${currentPage}: ${rowText}`);
                        // chamada da função extractPage()
                        extractPage(filename, `./cedulaC/${cpf.replaceAll('.', '_').replaceAll('-', '_')}.pdf`, currentPage);
                        geralogSucess('Arquivo criado com sucesso')
      
                }

                /*else{
                    geraLogErr("Erro ao encontrar argumento") //Está dando erro
                }*/
                //console.log(rowText)

            });

         if(!rowArray.includes(cpf)){
             geraLogErr("Erro ao encontrar argumento")
         }
        rows = {};
    }

    new PdfReader().parseFileItems(filename, (err, item) => {
        if (err) {
            console.error({ err });
        } else if (!item) {
            console.log('End of PDF');

        } else if (item.text) {
            rows[item.y] = rows[item.y] || [];
            const words = item.text.split(/\s+/); // split text into an array of words
            rows[item.y].push(...words); // push each word individually to the row
        } else if (item.page) {
            flushRows();
            currentPage = item.page;

        }
    });
}
//função que recorta a pagina do pdf
async function extractPage(inputPath, outputPath, pageNumber) {
    const pdfDoc = await PDFDocument.load(fs.readFileSync(inputPath))
    const newPdf = await PDFDocument.create()
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNumber - 1])
    newPdf.addPage(copiedPage)

    const extractedPdfBytes = await newPdf.save()
    fs.writeFileSync(outputPath, extractedPdfBytes)
}

function geraLogErr(msg) {
    saveLog(`./logs/error/${dataAtual}/${horaAtual}.log`).error(
        {
            Arquitetura: 'COMPROVANTE DE RENDIMENTO CES VIGILANCIA',
            Mensagem: msg,
            
        }
    )
}
function geralogSucess(msg) {
    saveLog(`./logs/sucess/${dataAtual}/${horaAtual}.log`).error(
        {
            Arquitetura: 'COMPROVANTE DE RENDIMENTO CES VIGILANCIA',
            Mensagem: msg
        }
    )
}
parser('173.550.362-20')
