export function closest(s)
{
	const matches = (this.document || this.ownerDocument).querySelectorAll(s);
	let i, el = this;

	do 
	{
		i = matches.length;

		while (--i >= 0 && matches.item(i) !== el) {};

	} while ((i < 0) && (el = el.parentElement));

	return el;
}
export function findIndex (predicate)
{
	const length = this.length;
	const arg = arguments[1];
	for (let i = 0; i < length; i++)
	{
		if (predicate.call(arg, this[i], i, this))
		{
			return i;
		}
	}
	return -1;
}
export function forEach (callback, argument) 
{
	argument = argument || window;
	for (let i = 0; i < this.length; i++)
	{
		callback.call(argument, this[i], i, this);
	}
}