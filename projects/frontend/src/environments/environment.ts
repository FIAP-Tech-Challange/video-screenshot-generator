export const environment = {
  production: false,
  /** Em dev o proxy (proxy.conf.json) encaminha /api para http://localhost:3000 */
  apiUrl: '/api',
  /** Deve ser igual ao MAX_FILE_SIZE_MB do api-bff (.env) */
  maxFileSizeMb: 10,
};
