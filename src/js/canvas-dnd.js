class CanvasDragAndDrop {
	constructor(id,then) {
		this.id = id
		this.canvas = document.createElement("canvas")
		this.context = this.canvas.getContext("2d")
		this.then = then || ()=>console.log("Image successfully loaded.")
		this.canvas.ondragover = e => {
			e.preventDefault()
		}
		let cnv = this.canvas, ctx = this.context
		this.canvas.ondrop = e => {
			e.preventDefault()
			let img = e.dataTransfer.files[0]
			if (!img.type.match(/image.*/))
				return alert("File rejected:",img.name,img.type,"\nAccepted file types: .jpg, .png, .gif")
			let f = new FileReader()
			f.onload = (e) => { 
				let image = new Image()
				image.onload = () => {
					ctx.clearRect(0,0,cnv.width,cnv.height)
					cnv.width = image.width
					cnv.height = image.height
					ctx.drawImage(image,0,0,image.width,image.height)
					then()
				}
				image.src = e.target.result
			}
			f.readAsDataURL(img)
		}
	}
}