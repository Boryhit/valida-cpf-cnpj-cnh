import express from 'express';
import { Request, Response } from 'express';
import validationBr, { isCPF } from "validation-br";
import cep from "cep-promise";
import { z } from 'zod'; // Importando a biblioteca zod

const app = express(); 
const port: number = 3000;

app.use(express.json());

// --- Esquemas de validação com Zod para parâmetros de rota ---
const cpfParamSchema = z.object({ cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido. Use o formato xxx.xxx.xxx-xx.") });
const cnpjParamSchema = z.object({ cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido. Use o formato xx.xxx.xxx/xxxx-xx.") });
const cnhParamSchema = z.object({ cnh: z.string().length(11, "CNH deve ter 11 dígitos.") });
const cepParamSchema = z.object({ cep: z.string().length(8, "CEP deve ter 8 dígitos.").regex(/^\d+$/, "CEP deve conter apenas números.") });

// Esquema de validação para o corpo da requisição de CPF
const validaCpfBodySchema = z.object({ cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido. Use o formato xxx.xxx.xxx-xx.") });

// --- Rotas de validação de documentos (GET e POST) ---
app.get('/valida-cpf/:cpf', (req: Request, res: Response) => {
    try {
        const { cpf } = cpfParamSchema.parse(req.params);
        if (validationBr.isCPF(cpf)) {
            return res.status(200).json({ mensagem: 'CPF Válido' });
        } else {
            return res.status(400).json({ mensagem: 'CPF Inválido' });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ mensagem: 'Erro de validação' });
        }
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});

app.post('/valida-cpf', (req: Request, res: Response) => {
    try {
        const { cpf } = validaCpfBodySchema.parse(req.body);
        if (validationBr.isCPF(cpf)) {
            return res.status(200).json({ mensagem: 'CPF Válido' });
        } else {
            return res.status(400).json({ mensagem: 'CPF Inválido' });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ mensagem: 'Erro de validação'});
        }
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});

app.get('/valida-cnpj/:cnpj', (req: Request, res: Response) => {
    try {
        const { cnpj } = cnpjParamSchema.parse(req.params);
        if (validationBr.isCNPJ(cnpj)) {
            return res.send('CNPJ Válido');
        } else {
            return res.send('CNPJ Inválido');
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ mensagem: 'Erro de validação',});
        }
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});

app.get('/valida-cnh/:cnh', (req: Request, res: Response) => {
    try {
        const { cnh } = cnhParamSchema.parse(req.params);
        if (validationBr.isCNH(cnh)) {
            return res.send('CNH Válido');
        } else {
            return res.send('CNH Inválido');
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ mensagem: 'Erro de validação' });
        }
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});
        
app.get('/valida-cep/:cep', async (req: Request, res: Response) => {
    try {
        const { cep: cepParam } = cepParamSchema.parse(req.params);
        const dados: any = await cep(cepParam)
            .then((data) => { return data })
            .catch((err) => { return err });
        return res.json({ dados:  dados });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ mensagem: 'Erro de validação'});
        }
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});
    
// --- Interfaces e dados ---
interface IPessoa {
    CPF: string;
    Nome: string;
    RG: string;
}

interface IEndereco {
    CEP: string;
    Rua: string;
    Bairro: string;
    Cidade: string;
    Estado: string;
}

interface ICliente extends IPessoa, IEndereco {
    Email: string;
}

let clientes: ICliente[] = [];

const novoCliente: ICliente = {
    CPF: '123.456.789-00',
    Nome: 'Maria Joana',
    RG: '12.345.678-9',
    CEP: '12345-678',
    Rua: 'Rua Principal',
    Bairro: 'Centro',
    Cidade: 'Minha Cidade',
    Estado: 'SP',
    Email: 'maria@exemplo.com'
}

clientes.push(novoCliente);

console.log('Clientes iniciais:', clientes);

// --- Rotas de Clientes (CRUD) ---
app.get('/clientes', (req: Request, res: Response) => {
    return res.json({ clientes: clientes });
});

app.get('/clientes/:cpf', (req: Request, res: Response) => {
    try {
        const { cpf: cpfParam } = cpfParamSchema.parse(req.params);
        
        const clienteEncontrado = clientes.find(cliente => cliente.CPF === cpfParam);
    
        if (clienteEncontrado) {
            return res.json(clienteEncontrado);
        }
      
        return res.status(404).json({ mensagem: 'Cliente não encontrado' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ mensagem: 'Erro de validação' });
        }
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});

const clienteSchema = z.object({
    CPF: z.string().min(1, { message: 'CPF é obrigatório.' }).regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido. Use o formato xxx.xxx.xxx-xx."),
    Nome: z.string().min(1, { message: 'Nome é obrigatório.' }),
    RG: z.string().min(1, { message: 'RG é obrigatório.' }),
    CEP: z.string().min(1, { message: 'CEP é obrigatório.' }),
    Rua: z.string().min(1, { message: 'Rua é obrigatória.' }),
    Bairro: z.string().min(1, { message: 'Bairro é obrigatório.' }),
    Cidade: z.string().min(1, { message: 'Cidade é obrigatória.' }),
    Estado: z.string().min(1, { message: 'Estado é obrigatório.' }),
    Email: z.string().email({ message: 'Email inválido.' }),
});

app.post('/clientes', (req: Request, res: Response) => {
    try {
        const novoCliente = clienteSchema.parse(req.body);

        const clienteExistente = clientes.find(cliente => cliente.CPF === novoCliente.CPF);
        if (clienteExistente) {
            return res.status(409).json({ mensagem: 'Cliente com este CPF já cadastrado.' });
        }
    
        clientes.push(novoCliente)
    
        return res.status(201).json(novoCliente);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ mensagem: 'Erro de validação nos dados do cliente.' });
        }
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});

app.delete('/clientes/:cpf', (req: Request, res: Response) => {
    try {
        const { cpf: cpfParam } = cpfParamSchema.parse(req.params);

        const clienteIndex = clientes.findIndex(cliente => cliente.CPF === cpfParam);

        if (clienteIndex > -1) {
            clientes.splice(clienteIndex, 1);
            return res.status(204).send();
        }
        
        return res.status(404).json({ mensagem: 'Cliente não encontrado' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ mensagem: 'Erro de validação'});
        }
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});

app.put('/clientes/:cpf', (req: Request, res: Response) => {
    try {
        const { cpf: cpfParam } = cpfParamSchema.parse(req.params);
        const clienteAtualizado = clienteSchema.parse(req.body);

        const clienteIndex = clientes.findIndex(cliente => cliente.CPF === cpfParam);

        if (clienteIndex === -1) {
            return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
        }

        if (clienteAtualizado.CPF !== cpfParam) {
            return res.status(400).json({ mensagem: 'O CPF no corpo da requisição deve ser o mesmo que o da URL.' });
        }

        clientes[clienteIndex] = clienteAtualizado;
        return res.status(200).json(clientes[clienteIndex]);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ 
                mensagem: 'Erro de validação nos dados do cliente.'
            });
        }
        
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});

app.listen(port, () => {
    console.log("Api iniciada na porta: " + port);
});
