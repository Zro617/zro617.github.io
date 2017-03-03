class TimedEvent {
	constructor(time,action,...events) {
		this.time = time
		this.action = action
		this.events = events
	}
	activate() {
		let te = this
		window.setTimeout(function(){
			te.action()
			if (te.events) for (let e of te.events) {
				e.activate()
			}
		},this.time)
	}
}