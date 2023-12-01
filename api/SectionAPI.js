import {get, put, post, nonJsonPost} from './BaseAPI';
import { combineParams } from '../managers/UtilsManager'
import BaseAPIV2 from './BaseAPIV2';

export default class SectionAPI extends BaseAPIV2 { 


	async getSections(zone, version=null, inclusionKind="manual", expansions=null) { 
		var url = "/sections"
		var params = []
		if (zone !== undefined && zone !== null) { 
			params.push({
				title: "zone",
				value: zone
			})
		}

		if (version !== null) { 
			params.push({
				title: 'version',
				value: version
			})
		}

		if (expansions) { 
			params.push({
				title: 'expansions',
				value: expansions
			})
		}

		params.push({
			title: 'inclusion_kind', 
			value: inclusionKind
		})

		url += combineParams(params)
		return await super.get(url);
	}
}