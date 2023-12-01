import BaseAPIV2 from "./BaseAPIV2"

export default class TagAPI extends BaseAPIV2 { 
    
    constructor() { 
        super(null, null);
    }

    async getTags() { 
       return await super.get("/tags")
    }

}