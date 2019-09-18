import * as THREE from 'three';

function evalQuaternion(v0, v1, refVertex=new THREE.Vector3(0,1,0)){
	let vref = refVertex;
	let vtar = v1.clone().sub(v0.clone()).normalize();
	
	let cross = vref.clone().cross(vtar).normalize();
	let angle = vref.clone().angleTo(vtar);
	
	let quat = new THREE.Quaternion().setFromAxisAngle( cross, angle );
	
	return quat;
}

class PipeCurve extends THREE.Curve{
	constructor(points){
		super();
		this.points = points;
		this.getPoint = this.getPoint.bind(this);
	}
	evalPointId(t){
		return t * (this.points.length-1);
	}
	getPoint(t){
		if(t === 0){
			return this.points[0];
		}else if(t === this.points.length-1){
			return this.points[this.points.length-1];
		}
		
		let pid = this.evalPointId(t);
		let lid = Math.floor(pid);
		let uid = lid + 1;
		let offs = pid % 1;
		
		if(uid === this.points.length){
			return this.points[uid-1];
		}
		
		let lp = this.points[lid].clone();
		let up = this.points[uid].clone();
		
		let dst = up.clone().sub(lp);
		
		return lp.add( dst.multiplyScalar(offs) );
	}
}

class PipeGeometry extends THREE.TubeGeometry {
	constructor(points, {
						tubularSegments = 6,
						radius = 1,
						radialSegments = 4,
						closed = false,
						color = 0x003300
						
					}={}){
		let path = new PipeCurve(points);
		
		super( path, tubularSegments, radius, radialSegments, closed );
		
		this.points = points;
	}
}
class StraightPipeGeometry extends PipeGeometry{
		constructor({
						tubularSegments = 6,
						radius = 1,
						radialSegments = 4,
						closed = false,
						color = 0x003300
						
					}={}){
		let pipepnts = [];
		pipepnts.push( new THREE.Vector3(-0.5, 0, 0) );
		pipepnts.push( new THREE.Vector3( 0.5, 0, 0) );
		
		super(pipepnts, {
						tubularSegments,
						radius,
						radialSegments,
						closed,
						color
						});
	}
}
class StraightPipeMesh extends THREE.Mesh{
	constructor(v0, v1, 
					material, 
					{
						tubularSegments = 6,
						radius = 0.1,
						radialSegments = 4,
						closed = false,
						color = 0x003300
					}={}){
		
		let geometry = new StraightPipeGeometry({
						tubularSegments,
						radius,
						radialSegments,
						closed,
						color
					});
		super(geometry, material);
		
		this.pos = new THREE.Vector3(0,0,0);
		
		this.updatePoints(v0, v1);
	}
	updatePoints(v0, v1){		
		let quat = evalQuaternion(v0, v1, new THREE.Vector3(1,0,0));
		let dst = v1.clone().sub(v0).length();
		let scl = dst;
		let offs = v0.clone().add(v1.clone().sub(v0).multiplyScalar(0.5));
		let pos = this.pos;
		let relOffs = offs.clone().sub(pos);
		
		this.rotation.setFromQuaternion( quat );
		
		if(scl > 0.1){
			// only scale if tarScle is greater than threshold -> otherwiese determinant === zero!!
			this.scale.set( scl, 1, 1 );
		}
		
		this.position.set(offs.x, offs.y, offs.z);
		
		this.pos.add(relOffs);
		this.scl = scl;
	}
}
class PipeArrow extends THREE.Group{
	constructor(v0, v1, 
					material, 
					{
						tubularSegments = 6,
						radius = 0.05,
						radialSegments = 4,
						closed = false,
						color = 0x003300
					}={}){		
		super();
		
		this.coneWidth = 0.125;
		this.coneHeight = 0.5;
		
		let lineMesh = new StraightPipeMesh(v0, v1, material, {
						tubularSegments,
						radius,
						radialSegments,
						closed,
						color
					});
		let coneGeometry = new THREE.ConeGeometry( this.coneWidth, this.coneHeight, 5 );
		let coneMesh = new THREE.Mesh( coneGeometry, material );
		
		this.add( lineMesh );
		this.add( coneMesh );
		
		this.coneMesh = coneMesh;
		this.lineMesh = lineMesh;
		
		this.updatePoints(v0, v1);
	}

	updatePoints(v0, v1){
		let dx = v1.clone().sub(v0).normalize().multiplyScalar(this.coneHeight * 0.5);
		
		let lineV1 = v1.clone().sub(dx);
		this.lineMesh.updatePoints(v0, lineV1);
		
		let coneV1 = v1.clone().sub(dx);
		
		this.coneMesh.position.set(coneV1.x, coneV1.y, coneV1.z);
		let quat = evalQuaternion(v0, v1, new THREE.Vector3(0,1,0));
		this.coneMesh.rotation.setFromQuaternion( quat );
	}
}

const PIPE = {
	StraightPipeGeometry,
	PipeGeometry,
	StraightPipeMesh,
	PipeArrow
};


export default PIPE;
