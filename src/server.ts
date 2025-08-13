import express from 'express'
import validationBr from "validation-br";

const app = express();
const port: number = 3000;

app.use(express.json());

app.get('/valida-cpf/:cpf', (req: Request, res: Response) => {
    if (validationBr.isCPF(req.params.cpf)){
        return res.send('CPF Válido')
    } else {
        return res.send('CPF Inválido')
    }
    });
    
app.get('/valida-cnpj/:cnpj', (req: Request, res: Response) => {
    if (validationBr.isCNPJ(req.params.cnpj)){
        return res.send('CNPJ Válido')
    } else {
        return res.send('CNPJ Inválido')
    }
    });

app.get('/valida-cnh/:cnh', (req:Request, res: Response) => {
    if (validationBr.isCNH(req.params.cnh)){
        return res.send('CNH Válido')
    } else {
        return res.send('CNH Inválido')
    }
    }
    
    );
	
app.listen(port, () => {
    console.log("Api iniciada na porta: " + port);
});
