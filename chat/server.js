Promise.resolve()
.then(stat =>
{
	const io = require('socket.io')(8000)
	.on('connection', socket =>
	{
		socket.emit('handshake', socket.handshake);

		const rooms = Rooms.singleton(io);

		socket.on('check in', ({ name, room }) =>
		{
			rooms.roomOf(room).userOf(name).attach(socket);
		})
		;
	})
	;
})
.catch(err =>
{
	throw err;
});
import { EventEmitter } from 'events';
class Rooms extends EventEmitter 
{
	static instance;
	static singleton = io =>
	{
		return Rooms.instance || (Rooms.instance = new Rooms(io));
	}
	constructor(io)
	{
		super();
		this.io = io;
		this.list = {};
	}
	roomOf = room => 
	{
		return this.list.room || (this.list.room = new Room({ rooms: this, room }));
	}
}
class Room extends EventEmitter 
{
	constructor({ rooms, room })
	{
		super();
		this.rooms = rooms;
		this.room = room;
		this.users = {};
	}
	toString = () => this.room;
	userOf = name =>
	{
		return this.users.name || (this.users.name = new User({ room: this, name }));
	}
}
class User extends EventEmitter 
{
	constructor({ room, name })
	{
		super();
		this.room = room;
		this.name = name;
	}
	toString = () => this.name;
	attach = socket =>
	{
		const { room, name } = this;
		this.socket = socket;
		socket.join(room);
		socket.emit('welcome', { name, room: room.toString() });
		return this;
	}
}
