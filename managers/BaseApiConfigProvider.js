
import AsyncStorage from '@react-native-async-storage/async-storage';

const prod = 'https://gameplanapp.herokuapp.com/api'
const stage = 'https://gameplanstageapp.herokuapp.com/api'
const local = 'http://192.168.1.7:8000/api'

const defaultEnv = prod;

class BaseApiConfigProvider { 

    constructor(envUrl) { 
        if (!envUrl) { 
            this.envUrl = defaultEnv;
        } else { 
            this.envUrl = envUrl;
        }
    }

    changeEnv(env) { 
		if (env == 'STAGE') { 
			this.envUrl = stage
		} else if (env == 'PROD') { 
			this.envUrl = prod
		} else { 
			this.envUrl = local
		}
        this.saveEnv();
	}

    setEnvUrl(envUrl) { 
        this.envUrl = envUrl;
        this.saveEnv();
    }

    getEnvType() { 
        if (this.envUrl === prod) { 
            return 'prod'
        } else if (this.envUrl === stage) {
            return 'stage';
        } else { 
            return 'dev';
        }
    }

    getEnvUrl() { 
        console.log(`env url = ${this.envUrl}`);
        return this.envUrl;
    }

    async loadUserEnvPreference() { 
		return new Promise((res, rej) => { 
			AsyncStorage.getItem('envUrl')
			.then((value) => {
				console.log(`Saved user environment Url = ${value}`)
				if (value != null) { 
					this.setEnvUrl(value);
				}
                res(value);
			}).catch(error => rej(error))
		})
	}
    
    saveEnv() { 
        AsyncStorage.setItem('envUrl', this.envUrl)
    }
}

const configProvider = new BaseApiConfigProvider();
export default configProvider