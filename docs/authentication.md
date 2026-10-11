# Cadastro, autenticação e treinador

## Fluxo
POST /api/auth/register valida dados e cria conta, treinador, token e entrega de e-mail na mesma transação. usernameKey e emailKey são normalizados em lowercase no servidor. Username aceita 3–32 letras ASCII, números ou sublinhado; senha aceita 12–128 caracteres. Nome do treinador aceita 2–32 caracteres e ainda não recebe restrição de unicidade, pendente de confirmação.

O e-mail de verificação leva a /verificar#token=...; a tela exige confirmação explícita. POST /api/auth/verify-email consome o token de uso único, válido por 24 horas. Só contas verificadas entram.

POST /api/auth/login recebe identifier (usuário/e-mail) e password, cria sessão por sete dias e envia cookie HttpOnly, SameSite=Lax, Path=/api; Secure em produção. O token aleatório só é armazenado como hash SHA-256. GET /api/auth/me devolve apenas dados públicos do perfil autenticado. POST /api/auth/logout revoga a sessão e limpa o cookie.

POST /api/auth/forgot-password e /api/auth/resend-verification respondem de modo genérico. POST /api/auth/reset-password usa token de 30 minutos, consome todos os tokens da mesma finalidade e revoga todas as sessões. O acesso é refeito com a nova senha.

PATCH /api/trainer/me altera apenas displayName do treinador associado à sessão. Não aceita userId, nível, XP, dinheiro nem campos extras.

## Segurança e limites
Senhas usam Argon2id. Tokens têm 32 bytes aleatórios e são consumidos atomicamente. Mudanças em senha e emissão de sessões serializam na linha da conta. DTOs rejeitam campos adicionais. Mutações exigem o Origin configurado em WEB_ORIGIN, inclusive em clientes HTTP manuais. Limite por IP/endpoint de 20 requisições/minuto usa armazenamento em memória do Nest Throttler; para múltiplas réplicas é necessário armazenamento compartilhado (Redis) e configuração explícita do proxy confiável.

Os links usam fragmentos, removidos do endereço pelo frontend; não entram em logs HTTP/referrers do frontend. Não há tokens em localStorage. Cookies funcionam com web/API no mesmo site, como localhost em portas diferentes. Produção deve manter frontend/API no mesmo site e HTTPS; configurações de domínio diferentes requerem revisão de cookies/CSRF.

Cadastro informa conflito genérico; recuperação/reenvio não informam se e-mail existe. Não se afirma proteção absoluta contra enumeração por tempo ou contra todos os ataques; monitoramento, proteção de borda e armazenamento compartilhado ainda são necessários antes de produção.

## Entrega de e-mail
Outbox no PostgreSQL contém payload cifrado com AES-256-GCM e MAIL_ENCRYPTION_KEY. SMTP é acionado a cada três segundos, com lease e retry exponencial, até dez tentativas. Após sucesso, payload é apagado. Entrega é pelo menos uma vez: após falha entre envio SMTP e confirmação no banco, o mesmo e-mail pode ser reenviado. Tokens são idempotentes do ponto de vista do consumo e expiram independentemente da entrega.

A chave deve ter 32 bytes hexadecimais. O exemplo zerado é só local e é rejeitado em produção. Rotação deve manter capacidade de descriptografar mensagens pendentes; não troque a chave com jobs pendentes sem plano de rotação. Monitoramento de jobs esgotados e rotina de retenção/limpeza de registros expirada são pendências operacionais antes de produção.

Mailpit é somente local: http://localhost:8025 recebe mensagens sem provedor real. Para produção definir SMTP_HOST/PORT/SECURE/USER/PASSWORD e MAIL_FROM; TLS exigido. Nenhum e-mail real é enviado pela CI.

## Escopo restante
Upload de foto, Oak, inicial, inventário e todos os módulos de jogo continuam no roadmap. Provedor real de e-mail, unicidade do nome do treinador e hospedagem continuam pendentes.
