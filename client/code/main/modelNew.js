
var modelObj = function()
{
	this.events = new (require('eventemitter2').EventEmitter2)()
	this.events.setMaxListeners(100)
	
	this.attributes = {}
}

modelObj.prototype.set = function(key, value)
{
	var path = key.split('.', 2)
	var level1 = path[0]
	var level2 = path[1]
	
	if(!this.attributes[level1])
	{
		this.attributes[level1] = {}
	}
	if(!this.attributes[level1][level2])
	{
		this.attributes[level1][level2] = {}
	}
	
	this.attributes[level1][level2] = value
	try
	{
		this.events.emit(key, {path: path, value:value})
	}catch(e){
		console.error(e.stack)
	}
	try
	{
		this.events.emit(level1, {path: path, value:value})
	}catch(e){
		console.error(e.stack)
	}
}

modelObj.prototype.get = function(key)
{
	var path = key.split('.')
	var level1 = path[0]
	var level2 = path[1]
	
	return this.attributes[level1] && this.attributes[level1][level2] ? this.attributes[level1][level2] : undefined
}

modelObj.prototype.on = function(key, cb)
{
	this.events.on(key, cb)
}

exports.model = new modelObj()

var modelObj2 = function()
{
	this.events = new (require('eventemitter2').EventEmitter2)()
	this.events.setMaxListeners(100)
	
	this.attributes = {}
}

modelObj2.prototype.serialize = function(key, pattern)
{
	var node = this.get(key)
	
	var levels = pattern.split('.').length-1
	
	var result = []
	
	function next(node, level)
	{
		if (level == 0)
		{
			Object.keys(node)
			.forEach(function(x)
			{
				result.push(node[x])
			})
		}
		else
		{
			Object.keys(node)
			.forEach(function(x)
			{
				next(node[x], level-1)
			})
		}
	}
	
	next(node, levels)
	
	return result
}

modelObj2.prototype.set = function(key, value, silent)
{
	var path = key.split('.')
	
	path.reduce(function(storage, key, idx, arr)
	{
		if (arr.length-1 == idx) {
			return storage[key] = value
		}
		if (! (key in storage))
		{
			storage[key] = {}
		}
		return storage[key]
	}, this.attributes)
	
	if (silent) return
	
	while (path.length > 0)
	{
		try
		{
			this.events.emit(path.join('.'), {key: key, value:value})
		}catch(e){
			console.error(e.stack)
		}
		
		path.splice(-1,1)
	}
}

modelObj2.prototype.get = function(key)
{
	return key.split('.')
	.reduce(function(storage, key)
	{
		if (key in storage)
		{
			return storage[key]
		}
		else
		{
			throw new Error('key does not exist -->'+key)
		}
	}, this.attributes)
}

modelObj2.prototype.getSafe = function(key)
{
	try {
		return this.get(key)	
	} catch(e) {
		return {}
	}
}


modelObj2.prototype.exists = function(key)
{
	try {
		key.split('.')
		.reduce(function(storage, key)
		{
			if (key in storage)
			{
				return storage[key]
			}
			else
			{
				throw new Error('key does not exist -->'+key)
			}
		}, this.attributes)
		return true
	} catch(e) {
		return false
	}
}

modelObj2.prototype.refresh = function(key)
{
	var path = key.split('.')
	
	while (path.length > 0)
	{
		try
		{
			this.events.emit(path.join('.'), {key: key, value:undefined})
		}catch(e){
			console.error(e.stack)
		}
		
		path.splice(-1,1)
	}
}

modelObj2.prototype.remove = function(baseKey, key, silence)
{
	var basePath = baseKey.split('.')
	var path = key.split('.')
	var bottomLevel = path.length-1
	while (path.length > 0)
	{
		var _key = baseKey+'.'+path.join('.')
		
		if (this.exists(_key))
		{
			path
			.reduce(function(storage, key, idx, arr)
			{
				if (arr.length-1 == idx)
				{
					if (bottomLevel == idx)
					{
						delete storage[key]
					}
					else if (Object.keys(storage[key]).length == 0)
					{
						delete storage[key]
					}

					if (Object.keys(storage).length == 0)
					{
						delete storage
					}
					return undefined
				}
				if (key in storage)
				{
					return storage[key]
				}
				else
				{
					throw new Error('key does not exist -->'+key)
				}
			}, this.get(baseKey))
	}
		path.splice(-1,1)
	}
	
	if (!silence)
	{
		this.refresh(baseKey+'.'+key)
	}
}

modelObj2.prototype.on = function(key, cb)
{
	this.events.on(key, cb)
}

exports.model2 = new modelObj2()





