import React from 'react';

const GitHubVercelGuide: React.FC = () => {
    return (
        <div>
            <p className="lead">
                Este guia objetivo e detalhado mostra o passo a passo para colocar um projeto no ar utilizando o GitHub para versionamento de código e o Vercel para publicação (deployment) contínua e gratuita.
            </p>

            <h3 id="part-1-github">Parte 1: GitHub - Preparando seu Código</h3>
            <p>O GitHub é uma plataforma para hospedar e gerenciar seu código-fonte usando Git. É o primeiro passo para tornar seu projeto acessível e pronto para a publicação.</p>

            <h4>Passo 1.1: Criar uma Conta no GitHub</h4>
            <ul>
                <li>Acesse <a href="https://github.com/join" target="_blank" rel="noopener noreferrer">github.com/join</a>.</li>
                <li>Siga as instruções para criar sua conta gratuita.</li>
            </ul>

            <h4>Passo 1.2: Criar um Novo Repositório</h4>
            <p>Um repositório é como uma pasta para o seu projeto, que armazena todo o seu código e o histórico de alterações.</p>
            <ol>
                <li>No canto superior direito do GitHub, clique no ícone de "+" e selecione <strong>New repository</strong>.</li>
                <li>Dê um nome ao seu repositório (ex: <code>meu-projeto-escolar</code>).</li>
                <li>Escolha se o repositório será <strong>Público</strong> (qualquer um pode ver) ou <strong>Privado</strong> (só você e quem você convidar). Para projetos de estudo, Público é comum.</li>
                <li>Marque a opção <strong>"Add a README file"</strong>. Isso cria um arquivo inicial de descrição.</li>
                <li>Clique em <strong>Create repository</strong>.</li>
            </ol>

            <h4>Passo 1.3: Enviar seu Código para o Repositório</h4>
            <p>Existem duas maneiras principais de fazer isso:</p>
            
            <h5>Método A: Upload Direto (Mais Simples)</h5>
            <ol>
                <li>Dentro do seu novo repositório no GitHub, clique no botão <strong>Add file</strong> e depois em <strong>Upload files</strong>.</li>
                <li>Arraste e solte a pasta do seu projeto ou selecione os arquivos do seu computador.</li>
                <li>Adicione uma mensagem de confirmação (commit), como "Versão inicial do projeto".</li>
                <li>Clique em <strong>Commit changes</strong>.</li>
            </ol>
            
            <h5>Método B: Usando Git (Padrão Profissional)</h5>
            <p>Este método requer que você tenha o <a href="https://git-scm.com/downloads" target="_blank" rel="noopener noreferrer">Git instalado</a> em seu computador.</p>
            <ol>
                <li>Abra o terminal na pasta do seu projeto.</li>
                <li>Execute os seguintes comandos, um por um:</li>
            </ol>
            <pre><code className="language-bash">
{`# Inicia o Git na sua pasta
git init

# Adiciona todos os arquivos para serem monitorados
git add .

# Salva uma "fotografia" do seu código com uma mensagem
git commit -m "Primeiro commit: versão inicial"

# Conecta sua pasta local ao repositório do GitHub
# (Copie a URL do seu repositório no GitHub)
git remote add origin URL_DO_SEU_REPOSITORIO.git

# Envia seu código para o GitHub
git push -u origin main`}
            </code></pre>
            <p>A partir de agora, sempre que fizer uma alteração importante, basta repetir os comandos <code>git add .</code>, <code>git commit -m "mensagem"</code> e <code>git push</code>.</p>


            <h3 id="part-2-vercel">Parte 2: Vercel - Publicando seu Projeto</h3>
            <p>O Vercel é uma plataforma que se conecta ao seu GitHub e publica automaticamente seu site, tornando-o acessível na internet com um link público.</p>

            <h4>Passo 2.1: Criar uma Conta no Vercel com GitHub</h4>
            <ol>
                <li>Acesse <a href="https://vercel.com/signup" target="_blank" rel="noopener noreferrer">vercel.com/signup</a>.</li>
                <li>Escolha a opção <strong>Continue with GitHub</strong>.</li>
                <li>Autorize o Vercel a acessar sua conta do GitHub. Isso é seguro e permite que ele veja seus repositórios.</li>
            </ol>

            <h4>Passo 2.2: Importar seu Projeto do GitHub</h4>
            <ol>
                <li>No painel do Vercel, clique em <strong>Add New...</strong> e selecione <strong>Project</strong>.</li>
                <li>O Vercel mostrará uma lista dos seus repositórios do GitHub. Encontre o repositório que você criou (ex: <code>meu-projeto-escolar</code>) e clique em <strong>Import</strong>.</li>
            </ol>

            <h4>Passo 2.3: Configurar e Publicar o Projeto</h4>
            <ol>
                <li><strong>Framework Preset:</strong> O Vercel é inteligente e geralmente detecta automaticamente a tecnologia do seu projeto (ex: Create React App, Vite, Next.js). Se ele detectar corretamente, você não precisa mudar nada.</li>
                <li><strong>Build and Output Settings:</strong> Na maioria dos casos, as configurações padrão funcionam perfeitamente. Não altere a menos que você saiba o que está fazendo.</li>
                <li><strong>Environment Variables:</strong> Se seu projeto precisa de chaves de API (como a do Gemini), este é o lugar para adicioná-las. É mais seguro do que deixá-las no código.</li>
                <li>Clique em <strong>Deploy</strong>.</li>
            </ol>
            <p>Aguarde alguns instantes. O Vercel irá "buildar" (construir) seu projeto e publicá-lo. Ao final, ele mostrará uma tela de sucesso com o link do seu site no ar!</p>

            <h3 id="part-3-workflow">Parte 3: O Fluxo Mágico - Deploy Automático</h3>
            <p>A maior vantagem dessa combinação é a integração contínua (CI/CD).</p>
            <ol>
                <li>Faça qualquer alteração no código do seu projeto no seu computador.</li>
                <li>Use os comandos do Git para enviar as alterações para o GitHub:
                    <pre><code className="language-bash">
{`git add .
git commit -m "Atualizei o título da página"
git push`}
                    </code></pre>
                </li>
                <li><strong>Automaticamente</strong>, o Vercel detectará essa nova alteração no GitHub, iniciará um novo processo de build e publicará a versão atualizada do seu site no mesmo link.</li>
            </ol>

            <h3 id="conclusion">Conclusão</h3>
            <p>Parabéns! Seguindo estes passos, você configurou um fluxo de trabalho profissional para desenvolvimento e publicação de projetos web. Agora você pode focar em programar, sabendo que cada atualização enviada ao GitHub será publicada na web de forma rápida e segura.</p>
        </div>
    );
};

export default GitHubVercelGuide;
