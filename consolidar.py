import os

def consolidar_repositorio(diretorio_raiz, arquivo_saida):
    # Pastas e arquivos que devem ser ignorados
    ignorar_dirs = {'.git', 'node_modules', '__pycache__', 'dist', 'build', '.venv', '.vscode'}
    ignorar_exts = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.zip', '.lock'}

    with open(arquivo_saida, 'w', encoding='utf-8') as f_out:
        f_out.write(f"# REPOSITÓRIO COMPLETO - APP DENTIS\n")
        f_out.write(f"Este documento contém a estrutura e o código do projeto para fins de revisão técnica e IA.\n\n")

        for raiz, dirs, arquivos in os.walk(diretorio_raiz):
            # Filtra pastas ignoradas
            dirs[:] = [d for d in dirs if d not in ignorar_dirs]

            for nome_arquivo in arquivos:
                extensao = os.path.splitext(nome_arquivo)[1].lower()
                
                # Pula arquivos binários ou de imagem
                if extensao in ignorar_exts or nome_arquivo == arquivo_saida:
                    continue

                caminho_completo = os.path.join(raiz, nome_arquivo)
                caminho_relativo = os.path.relpath(caminho_completo, diretorio_raiz)

                try:
                    with open(caminho_completo, 'r', encoding='utf-8') as f_in:
                        conteudo = f_in.read()
                        
                        # Formata a saída no Markdown
                        f_out.write(f"--- \n")
                        f_out.write(f"### ARQUIVO: {caminho_relativo}\n")
                        f_out.write(f"```{extensao.replace('.', '') or 'text'}\n")
                        f_out.write(conteudo)
                        f_out.write(f"\n```\n\n")
                except Exception as e:
                    print(f"Erro ao ler {caminho_relativo}: {e}")

    print(f"Sucesso! O repositório foi consolidado em: {arquivo_saida}")

if __name__ == "__main__":
    # Define o diretório atual como raiz (pode mudar para o caminho da pasta do Dentis)
    diretorio_do_projeto = os.getcwd() 
    nome_do_arquivo_final = "dentis_contexto_total.md"
    
    consolidar_repositorio(diretorio_do_projeto, nome_do_arquivo_final)