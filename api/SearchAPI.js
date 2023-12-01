import BaseAPIV2 from "./BaseAPIV2";
import { combineParamsV2 } from '../managers/UtilsManager'

export default class SearchAPI extends BaseAPIV2 { 

    constructor() { 
        super(null, null);
    }

    async search({query=null, respType="event", tags=null, limit=20, expansions="tag", page=1, zoneSlug=null, categories=null} = {}) { 
        var url = "/search"
        var params = []
        if (query) { 
            params.push({
                query: query
            })
        }
        if (tags) { 
            params.push({
                tags: tags
            })
        }
        if (zoneSlug) { 
            params.push({zone_slug: zoneSlug})
        }

        if (limit) { 
            params.push({page_size: limit})
        }
        if (categories) { 
            params.push({categories: categories})
        }
        if (expansions) { 
            params.push({expansions: expansions});
        }

        if (page){ 
            params.push({page: page})
        }
        if (respType) { 
            params.push({resp_type: respType});
        }
        url += combineParamsV2(params);
        return await super.get(url);
    }
}