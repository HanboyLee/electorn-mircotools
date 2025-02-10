export const getEnvConfig = () => {
  return {
    SHUTTERSTOCK_APPLICATION_ID: import.meta.env.VITE_SHUTTERSTOCK_APPLICATION_ID || '',
    SHUTTERSTOCK_APPLICATION_SEC: import.meta.env.VITE_SHUTTERSTOCK_APPLICATION_SEC || '',
    SHUTTERSTOCK_TOKEN: import.meta.env.VITE_SHUTTERSTOCK_TOKEN || ''
  };
};

export default getEnvConfig;
