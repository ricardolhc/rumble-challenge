# Modo caça-níquel

Modo opcional em Configurações → Sorteios. O modo clássico continua sendo o
padrão, e a preferência fica salva junto das demais configurações.

## Comportamento

- Um a três rolos verticais, com personagens visíveis antes do primeiro sorteio.
- Os rolos começam rápidos e param da esquerda para a direita. Cada rolo só
  freia após o anterior parar; a chegada ao vencedor desacelera suavemente.
- Opções vizinhas aparecem em cinza acima e abaixo da posição central.
- A alavanca fica encostada à direita da caixa, com movimento vertical completo.
  O evento de fim da descida dispara o sorteio; o retorno ocorre durante o giro.
- Lâmpadas alinhadas nas quatro quinas e distribuídas pelas bordas piscam em
  duas fases alternadas. Movimento reduzido mantém a iluminação estática.
- O sorteio conserva quantidade, velocidades, banimentos globais e individuais,
  nomes únicos, modo desafio, histórico, sons e o modal de resultado existentes.
- O host transmite os mesmos quadros e a sequência de animação aos participantes.

## Implementação

As faixas dos rolos permanecem montadas e usam Web Animations com transform.
Os quadros de progresso usam prazos absolutos, e as diferenças de tempo na sala
são corrigidas sem reconstruir a arte. O ciclo da alavanca impede acionamentos
duplicados e cancela a ação pendente se o componente for desmontado.
Os componentes reutilizam CharacterCardContents e DrawButton, sem dependências
novas. A interface tem traduções nos seis idiomas existentes.

## Verificação

- `npm test`: 31 testes aprovados.
- `npm run build`: aprovado, com avisos preexistentes de fontes ausentes.
- `npm run lint`: mesmos 3 erros e 4 avisos preexistentes.
- `git diff --check`: aprovado.

Os testes cobrem sequência dos rolos, candidatos permitidos, parada progressiva,
sincronização, modo instantâneo, prévia inicial, configuração salva, renderização
dos componentes e disparo do sorteio somente no fim da descida da alavanca.
A inspeção visual via Computer Use foi interrompida pela ferramenta por não
conseguir confirmar a URL atual da janela do navegador.
