import _ from 'lodash';
Object.assign(Node.prototype, {
	on (e, handler) { _.castArray(e).map(e => this.addEventListener(e, handler, true)); }, 
	off(e, handler) { _.castArray(e).map(e => this.removeEventListener(e, handler, true)); }, 
	hittest(x, y)
	{
		const { left, top, right, bottom } = this.getBoundingClientRect();
		return _.inRange(x, left, right) && _.inRange(y, top, bottom);
	}, 
});