import { isEmpty as lodash_isEmpty } from 'lodash';

export default (payload: string | null | undefined | ''): payload is null | undefined | '' => {
	if (payload === null) {
		return true;
	}
	if (payload === undefined) {
		return true;
	}
	if ((payload as any) instanceof String || typeof payload === 'string') {
		return `${payload || ''}`.trim().length === 0;
	}
	return lodash_isEmpty(payload);
};