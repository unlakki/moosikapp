import fetch from 'node-fetch';
import OS from 'os';
import ConfigProvider from './ConfigProvider';

class StatusProvider {
  private readonly _configProvider: ConfigProvider;

  constructor(confoigProvider: ConfigProvider) {
    this._configProvider = confoigProvider;
  }

  public get = async () => {
    const api = this.getApiStatus();
    const cdn = (await this.tryGetCdnStatus()) || 'unavailable';

    return { api, cdn };
  };

  private getApiStatus = () => {
    const api = {
      cpu: {
        loadavg: OS.loadavg(),
      },
      memory: {
        free: OS.freemem(),
        total: OS.totalmem(),
      },
      serverTime: new Date(),
    };

    return api;
  };

  private tryGetCdnStatus = async () => {
    try {
      const response = await fetch(this.getCdnStatusCheckUri());
      return response.json();
    } catch (e) {
      return null;
    }
  };

  private getCdnStatusCheckUri = () => {
    return `${this._configProvider.cdnServerUri}/status.json`;
  };
}

export default StatusProvider;