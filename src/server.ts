import express from 'express';
import { Request, Response} from 'express';
import validationBr, { isCPF } from "validation-br";
import cep from "cep-promise";

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
    });
        
app.get('/valida-cep/:cep', async (req: Request<{ cep: string | number }>, res: Response) => {
        const dados: any = await cep(req.params.cep)
                                .then((data) => { return data })
                                .catch((err) => { return err });
        return res.json({ dados:  dados })
    });
    
    
app.listen(port, () => {
    console.log("Api iniciada na porta: " + port);
});

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

// Criação do array de clientes
let clientes: ICliente [] = [];

const novoCliente: ICliente ={
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

// Adicionando o novo cliente ao array
clientes.push(novoCliente);

console.log(clientes);

app.get('/clientes', (req: Request, res: Response) => {
    // Retorna o array de clientes como uma resposta JSON
    return res.json({ clientes: clientes });
  });

app.get('/clientes/:cpf', (req: Request, res: Response) => {
    const cpfParam = req.params.cpf;
    
    // Busca o cliente no array que tem o CPF correspondente
    const clienteEncontrado = clientes.find(cliente => cliente.CPF === cpfParam);
  
    // Se o cliente for encontrado, retorna-o
    if (clienteEncontrado) {
      return res.json(clienteEncontrado);
    }
  
    // Se o cliente não for encontrado, retorna um erro 404
    return res.status(404).json({ mensagem: 'Cliente não encontrado' });
  });

  // Assumindo que você tem uma função de validação de CPF
import validarCPF from 'validation-br'; // Importe sua função de validação

app.post('/clientes', (req: Request, res: Response) => {
  const novoCliente: ICliente = req.body;

  // 1. Valida o CPF
  if (!isCPF(novoCliente.CPF)) {
    return res.status(400).json({ mensagem: 'CPF inválido. O cadastro não foi realizado.' });
  }})

  // 2. Verifica se o cliente já existe
  const clienteExistente = clientes.find(cliente => cliente.CPF === novoCliente.CPF);
  if (clienteExistente) {
    return res.status(409).json({ mensagem: 'Cliente com este CPF já cadastrado.' });
  }

  // 3. Se a validação passar, adiciona o cliente ao array
  clientes.push(novoCliente);

  // 4. Retorna a resposta de sucesso com o novo cliente
  return res.status(201).json(novoCliente);
});