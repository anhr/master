/**
 * @module AxesHelper
 * @description An axis object to visualize the 1, 2 or 3 axes.
 * @author {@link https://anhr.github.io/AboutMe/|Andrej Hristoliubov}
 *
 * @copyright 2011 Data Arts Team, Google Creative Lab
 *
 * @license under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
*/

import { SpriteText } from '../../SpriteText/master/SpriteText.js';//https://github.com/anhr/SpriteText
//import { SpriteText } from 'https://raw.githack.com/anhr/SpriteText/master/SpriteText.js';

import clearThree from '../../commonNodeJS/master/clearThree.js';//https://github.com/anhr/commonNodeJS
//import clearThree from 'https://raw.githack.com/anhr/commonNodeJS/master/clearThree.js';

import { getObjectPosition } from '../../commonNodeJS/master/guiSelectPoint.js';//https://github.com/anhr/commonNodeJS
//import clearThree from 'https://raw.githack.com/anhr/commonNodeJS/master/guiSelectPoint.js';


/**
 * An axis object to visualize the 1, 2 or 3 axes.
 * @param {THREE} THREE {@link https://github.com/anhr/three.js|THREE}
 * @param {THREE.Group|THREE.Scene} group THREE group or scene
 * @param {object} [options] followed options is available
 * @param {object} [options.color] axes color. Available color names see var _colorKeywords in the threejs. Default is 'white'.
 * @param {number} [options.scales] axes scales. Default is {}
 * @param {THREE.Group} [options.groupMove] group of the meshes you have added to the scene.
 * Scales of the axes is depending from scale, position and rotation of this group. Default is group.
 * 
 * @param {number} [options.scales.axisName] x or y or z
 * @param {number} [options.scales.axisName.zoomMultiplier] zoom multiplier. Default is 1.1
 * @param {number} [options.scales.axisName.offset] position offset. Default is 0.1
 * @param {string} [options.scales.axisName.name] axis name. Default is axisName.
 * @param {number} [options.scales.axisName.min] Minimum range of the y axis. Default is -1.
 * @param {number} [options.scales.axisName.max] Maximum range of the y axis. Default is 1.
 * @param {number} [options.scales.axisName.marks] Number of y scale marks. Default is undefined no marks.
*
 * @param {object} [options.scaales.text] followed options of the text of the marks is available
 * @param {boolean} [options.scales.text.precision] Formats a scale marks into a specified length. Default is 4
 * @param {number} [options.scales.text.textHeight] The height of the text. Default is 0.1.
 * @param {object} [options.scales.text.rect] rectangle around the text.
 * @param {boolean} [options.scales.text.rect.displayRect] true - the rectangle around the text is visible. Default is true.
 * @param {THREE.PerspectiveCamera} [options.camera] camera.
 * Set the camera if you want to see text size is independent from camera.fov. The text height will be calculated as textHeight = camera.fov * textHeight / 50
 * See https://threejs.org/docs/index.html#api/en/cameras/PerspectiveCamera.fov about camera.fov.
 * Default is undefined. Default camera.fov is 50.
*/
export function AxesHelper( THREE, group, options ) {

	const axesHelper = this;

	SpriteText.setTHREE( THREE );
	
	options = options || {};
	options.color = options.color || 'white';//0xffffff;

	//Создаю новый объект camera что бы не засорять cookie лишней информацией
	options.camera = {

//		position: new THREE.Vector3( 0.4, 0.4, 2 ),
		fov: options.camera !== undefined ? options.camera.fov : 50,

	};

	options.scales = options.scales || {};
	options.scales.display = options.scales.display !== undefined ? options.scales.display : false;
	options.scales.text = options.scales.text || {};
//	options.scales.text.precision = options.scales.text.precision || 4;
//	options.scales.text.textHeight = options.scales.text.textHeight || 0.1;
	options.scales.text.rect = options.scales.text.rect || {};
	options.scales.text.rect.displayRect = options.scales.text.rect.displayRect !== undefined ? options.scales.text.rect.displayRect : true;
	options.scales.text.rect.borderRadius = options.scales.text.rect.borderRadius !== undefined ? options.scales.text.rect.borderRadius : 15;
	function scaleOptions( axisName ) {

		const scale = options.scales[axisName];
		if ( !scale )
			return;
		if ( scale.min === undefined ) scale.min = - 1;
		if ( scale.max === undefined ) scale.max = 1;
		if ( scale.marks === undefined ) scale.marks = 3;
		if ( scale.offset === undefined ) scale.offset = 0.1;
		if ( scale.zoomMultiplier === undefined ) scale.zoomMultiplier = 1.1;

	}
	scaleOptions('x');
	scaleOptions('y');
	scaleOptions('z');

	this.options = options;

	const groupAxesHelper = new THREE.Group();
	groupAxesHelper.userData.optionsSpriteText = {

		fontColor: options.color,
		//textHeight: options.scales.text.textHeight,
//		fov: options.scales.text.fov,
		fov: options.camera.fov,
		rect: options.scales.text.rect,

	}
	group.add( groupAxesHelper );

	const posAxesIntersection = new THREE.Vector3().copy( group.position ).divide( group.scale );//For moving of the axes intersection to the center of the canvas ( to the camera focus ) 

	/**
	 * create axis
	 * @function this.
	 * createAxis
	 * @param {string} axisName axis name
	 */
	this.createAxis = function ( axisName ) {

		const group = new THREE.Group();
//		groupAxesHelper.add( group );
		group.visible = options.scales.display;
		
		const scale = options.scales[axisName];
		if ( !scale )
			return;
/*			
		if ( scale.min === undefined ) scale.min = - 1;
		if ( scale.max === undefined ) scale.max = 1;
*/		

		var color = options.color, opacity = 1;
		try {

			var array = options.color.split( /rgba\(\.*/ )[1].split( /\)/ )[0].split( /, */ );
			color = 'rgb(' + array[0] + ', ' + array[1] + ', ' + array[2] + ')';
			if ( array[3] !== undefined )
				opacity = array[3];

		} catch ( e ) {}
		const lineAxis = new THREE.Line( new THREE.BufferGeometry().setFromPoints( [

			//Begin vertice of the axis
			new THREE.Vector3(

				//X
				axisName !== 'x' ? 0
					: !options.scales.x ? 0//X axis is not exists
						: options.scales.x.min,//begin of the X axix
				//Y
				axisName !== 'y' ? 0
					: !options.scales.y ? 0//Y axis is not exists
						: options.scales.y.min,//begin of the Y axix
				//Z
				axisName !== 'z' ? 0
					: !options.scales.z ? 0//Z axis is not exists
						: options.scales.z.min,//begin of the Z axix

			),
			//end vertice of the axis
			new THREE.Vector3(

				//X
				axisName !== 'x' ? 0
					: !options.scales.x ? 0//X axis is not exists
						: options.scales.x.max,//end of the X axix
				//Y
				axisName !== 'y' ? 0
					: !options.scales.y ? 0//Y axis is not exists
						: options.scales.y.max,//end of the Y axix
				//Z
				axisName !== 'z' ? 0
					: !options.scales.z ? 0//Z axis is not exists
						: options.scales.z.max,//end of the Z axix

			),
		] ), new THREE.LineBasicMaterial( { color: color, opacity: opacity, transparent: true, } ) );
		//moving of the axes intersection to the center of the canvas ( to the camera focus )
		if ( axisName !== 'x' ) lineAxis.position.x = - posAxesIntersection.x;
		if ( axisName !== 'y' ) lineAxis.position.y = - posAxesIntersection.y;
		if ( axisName !== 'z' ) lineAxis.position.z = - posAxesIntersection.z;
		lineAxis.add( group );
		lineAxis.userData.axisName = axisName;
		groupAxesHelper.add( lineAxis );

//		if ( ( scale.marks !== undefined ) && options.scales.display )
		if ( scale.marks !== undefined )
		{

			const groupMove = options.groupMove || group,
//				posGroup = axisName === 'x' ? groupMove.position.x : axisName === 'y' ? groupMove.position.y : axisName === 'z' ? groupMove.position.z : 0,
				SpriteMark = function (
					position,
//				options
			) {

				position = position || new THREE.Vector3( 0, 0, 0 );
				//console.warn( 'axisName: ' + axisName + ' position = ' + position.x + ', ' + position.y + ', ' + position.z );
//				options = options || {};
				const sizeAttenuation = false;


				const sprite = new THREE.Sprite( new THREE.SpriteMaterial( {

					map: new THREE.Texture(),
					sizeAttenuation: sizeAttenuation,

				} ) );
				const canvas = document.createElement( 'canvas' );
				sprite.material.map.minFilter = THREE.LinearFilter;
				const context = canvas.getContext( '2d' );

				function update() {

					const center = new THREE.Vector2(

						//x
						axisName !== 'y' ? 0.5 ://For x and z axes риска не сдвигается
							0,//For y axes риска сдвигается вправо

						//y
						axisName === 'y' ? 0.5 ://For y axes риска не сдвигается
							1//For x and z axes риска сдвигается вниз

					);
					var width = 3;//, linesCount = 1,
					context.fillStyle = options.color;//'rgba(0, 255, 0, 1)';
					context.fillRect(0, 0, canvas.width, canvas.height);

					// Inject canvas into sprite
					sprite.material.map.image = canvas;
					sprite.material.map.needsUpdate = true;

					if ( axisName === 'y' ) {

						sprite.scale.x = ( width * ( canvas.width / canvas.height ) ) / canvas.width ;
						sprite.scale.y = 1 / canvas.height;

					} else {

						sprite.scale.x = 1 / canvas.width;
						sprite.scale.y = width / canvas.height;

					}
/*					
sprite.scale.x /= 2;
sprite.scale.y /= 2;
*/
					sprite.scale.x *= options.camera.fov / ( 50 * 2 );
					sprite.scale.y *= options.camera.fov / ( 50 * 2 );
					
					sprite.position.copy( position );
					sprite.center = center;

					//size attenuation. Whether the size of the sprite is attenuated by the camera depth. (Perspective camera only.) Default is false.
					//See https://threejs.org/docs/index.html#api/en/materials/SpriteMaterial.sizeAttenuation
					sprite.material.sizeAttenuation = sizeAttenuation;

//					sprite.material.rotation = rotation;
					sprite.material.needsUpdate = true;

					function getTextPrecision() {

						return options.scales.text.precision !== undefined ? text.toPrecision( options.scales.text.precision ) : text.toString();

					}
//					var text = ( axisName === 'x' ? position.x + posGroup : axisName === 'y' ? position.y + posGroup : position.z + posGroup );
//					var text = ( axisName === 'x' ? position.x - posGroup : axisName === 'y' ? position.y - posGroup : position.z - posGroup );
					var text = ( axisName === 'x' ? position.x : axisName === 'y' ? position.y : position.z );
					function getCenterX() {

						const a = ( 0.013 - 0.05 ) /15, b = 0.013 - 17 * a;
//						const a = ( 0.013 - 0.1 ) /16, b = 0.013 - 17 * a;
						return - width * ( getTextPrecision().length * a + b );

					}
					const spriteText = new SpriteText(
						getTextPrecision(),
						new THREE.Vector3(
							position.x,// + ( axisName === 'y' ? width / canvas.width : 0 ),
							position.y,
							position.z,
						), {

						group: group,
						rotation: axisName === 'y' ? 0 : - Math.PI / 2,
						center: new THREE.Vector2(

//							-0.1,//текст по оси y сдвигается вправо
//							 - width * 0.05,//текст по оси y сдвигается вправо
//							 - width * 0.013,//текст по оси y сдвигается вправо
//							 - width * ( textPrecision.length * a + b ),//текст по оси y сдвигается вправо
							 getCenterX(),//текст по оси y сдвигается вправо
							//текст по оси x и z сдвигается вниз

							axisName === 'x' ? 1 ://текст по оси x сдвигается влево
								0,//текст по оси z сдвигается вправо,
							//текст по оси y сдвигается вверх

						),
						/*
												fontColor: options.color,
												textHeight: options.scales.text.textHeight,
												fov: options.scales.text.fov,
												rect: options.scales.text.rect,
						*/

					} );
					spriteText.userData.updatePrecision = function () {

						spriteText.userData.updateText( text.toPrecision( options.scales.text.precision ) );
//						spriteText.center.x = - width * ( options.scales.text.precision * a + b );
						spriteText.center.x = getCenterX();

					}
					group.add( spriteText );

				};
				update();
				return sprite;

			};
			const max = scale.max,
				min = scale.min,
				d = ( max - min ) / ( scale.marks - 1 );
			for ( var i = 0; i < scale.marks; i++ ) {

				const pos = i * d + min;
				group.add( new SpriteMark( new THREE.Vector3(
					axisName === 'x' ? pos : 0,
					axisName === 'y' ? pos : 0,
					axisName === 'z' ? pos : 0,
				) ) );

			}
		}

		//Axis name
		var axisNameOptions = {

/*
			fontColor: options.color,
//						rotation: axisName === 'y' ? 0 : - Math.PI / 2,
			textHeight: options.scales.text.textHeight,
			rect: options.scales.text.rect,
*/
			center: new THREE.Vector2(
				axisName === 'y' ? 1.1 : -0.1,
				axisName === 'y' ? 0 : -0.1
			),
			group: group,

		}
		scale.name = scale.name || axisName;
		group.add( new SpriteText(
			scale.name,
			new THREE.Vector3(
				axisName === 'x' ? scale.max : 0,
				axisName === 'y' ? scale.max : 0,
				axisName === 'z' ? scale.max : 0,
			), axisNameOptions ) );
		group.add( new SpriteText(
			scale.name,
			new THREE.Vector3(
				axisName === 'x' ? scale.min : 0,
				axisName === 'y' ? scale.min : 0,
				axisName === 'z' ? scale.min : 0,
			), axisNameOptions ) );
//		axesGroups[axisName] = group;

	}
	this.createAxis( 'x' );
	this.createAxis( 'y' );
	this.createAxis( 'z' );

//	updateSpriteTextGroup( groupAxesHelper );

	//dotted lines
	function dotLines( _scene ) {

		var lineX, lineY, lineZ, scene = _scene,
			groupDotLines, intersection;
		this.remove = function () {

			if ( groupDotLines === undefined )
				return;

			//clear memory
			//
			//Если это не делать, то со временем может произойти событие webglcontextlost
			//https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event
			//
			//for testing
			//	open http://localhost/threejs/nodejs/controllerPlay/Examples/html/ page
			//	select a point
			//	open dat.gui
			//	in the PlayController:
			//		click the ⥀ button
			//		Rate of changing of animation scenes per second to 25
			//		click the ► play button
			//	Now you can see animation of the scene
			//	In the Windows open Resource Monitor
			//		Open the Memory tab
			//		The Commit(KB) for chrome.exe do not increasing about 20 minutes.
			clearThree( groupDotLines );

			scene.remove( groupDotLines );
			groupDotLines = undefined;
			lineX = undefined;
			lineY = undefined;
			lineZ = undefined;

		};
		function createGroup() {

			dotLines.remove();
			groupDotLines = new THREE.Group();
			scene.add( groupDotLines );

		}
		function verticeAxis( position, scale ) { return - position / scale; }
		function getDashSize() {

			return 0.05 / ( Math.max( Math.max( group.scale.x, group.scale.y ), group.scale.z ) );

		}
		this.dottedLines = function ( _intersection ) {

			intersection = _intersection;
			const pointVertice = intersection instanceof THREE.Vector4 || intersection instanceof THREE.Vector3 ? intersection : getObjectPosition( intersection.object, intersection.index );
			if ( groupDotLines !== undefined ) {

				function dottedLine( axisName/*axesId*/ ) {

					var line;
					switch ( axisName ) {

						case 'x':
							line = lineX;
							break;
						case 'y':
							line = lineY;
							break;
						case 'z':
							line = lineZ;
							break;
						default: console.error( 'AxesHelper.dotLines.dottedLines.dottedLine: axesId = ' + axesId );
							return;

					}
					if ( !line )
						return;//Current axis is not exists
					var lineVertices = line.geometry.attributes.position.array;
					lineVertices[0] = axisName === 'x' ? pointVertice.x :
						verticeAxis( group.position.x, group.scale.x );
					lineVertices[1] = axisName === 'y' ? pointVertice.y :
						verticeAxis( group.position.y, group.scale.y );
					lineVertices[2] = axisName === 'z' ? pointVertice.z :
						verticeAxis( group.position.z, group.scale.z );

					lineVertices[3] = pointVertice.x;
					lineVertices[4] = pointVertice.y;
					lineVertices[5] = pointVertice.z;

					var size = getDashSize();//axesId );
					lineX.material.dashSize = size;
					lineX.material.gapSize = size;

					line.geometry.attributes.position.needsUpdate = true;

				}
				dottedLine( 'x' );
				dottedLine( 'y' );
				dottedLine( 'z' );
				return;

			}

			createGroup();

			function dottedLine( axisName /*axesId*/ ) {

				if ( !options.scales[axisName] )
					return;
				var lineVertices = [
					new THREE.Vector3( 0, 0, 0 ),
					pointVertice,
				];
				lineVertices[0].x = axisName === 'x' ? lineVertices[1].x : verticeAxis( group.position.x, group.scale.x );
				lineVertices[0].y = axisName === 'y' ? lineVertices[1].y : verticeAxis( group.position.y, group.scale.y );
				lineVertices[0].z = axisName === 'z' ? lineVertices[1].z : verticeAxis( group.position.z, group.scale.z );

				var size = getDashSize();
				if ( options.colorsHelper === undefined )
					options.colorsHelper = 0x80;
				var line = new THREE.LineSegments( new THREE.BufferGeometry().setFromPoints( lineVertices ),
					new THREE.LineDashedMaterial( {
						color: 'rgb(' + options.colorsHelper + ', ' + options.colorsHelper + ', ' + options.colorsHelper + ')',
						dashSize: size, gapSize: size
					} ) );
				line.computeLineDistances();
				groupDotLines.add( line );
				return line;

			}
			lineX = dottedLine( 'x' );
			lineY = dottedLine( 'y' );
			lineZ = dottedLine( 'z' );

		};
		this.update = function () {

			if ( ( groupDotLines === undefined ) || ( intersection === undefined ) )
				return;
			
			this.dottedLines( intersection );
/*			
			function dottedLine( axesId, line ) {

				var size = getDashSize();
				line.material.dashSize = size;
				line.material.gapSize = size;

				var positionArray = line.geometry.attributes.position.array,
					itemSize = line.geometry.attributes.position.itemSize;

				const x = 0, y = 1, z = 2;
				positionArray[itemSize + x] =
					axesId === 'x' ? positionArray[x] : verticeAxis( group.position.x, group.scale.x );
				positionArray[itemSize + y] =
					axesId === 'y' ? positionArray[y] : verticeAxis( group.position.y, group.scale.y );
				positionArray[itemSize + z] =
					axesId === 'z' ? positionArray[z] : verticeAxis( group.position.z, group.scale.z );
				line.geometry.attributes.position.needsUpdate = true;

			}
			groupDotLines.children.forEach( function ( line ) {

				dottedLine( 'x', line );

			} );
*/			
/*			
			dottedLine( axesHelper.axesEnum.x, groupDotLines.children[axesHelper.axesEnum.x] );
			dottedLine( axesHelper.axesEnum.y, groupDotLines.children[axesHelper.axesEnum.y] );
			dottedLine( axesHelper.axesEnum.z, groupDotLines.children[axesHelper.axesEnum.z] );
*/			

		}
		this.movePointAxes = function ( axesId, value ) {

			var line;
			switch ( axesId ) {

				case mathBox.axesEnum.x:
					line = lineX;
					break;
				case mathBox.axesEnum.y:
					line = lineY;
					break;
				case mathBox.axesEnum.z:
					line = lineZ;
					break;
				default: console.error( 'point.userData.movePointAxes: invalid axesId: ' + axesId );
					return;

			}
			if ( line === undefined )
				return;
			line.geometry.attributes.position.array[axesId + 3] = value;

			lineX.geometry.attributes.position.array[axesId] = value;
			lineY.geometry.attributes.position.array[axesId] = value;
			lineZ.geometry.attributes.position.array[axesId] = value;

			lineX.geometry.attributes.position.needsUpdate = true;
			lineY.geometry.attributes.position.needsUpdate = true;
			lineZ.geometry.attributes.position.needsUpdate = true;

		};

	}
	dotLines = new dotLines( group );

	/**
	* Expose position on axes.
	* @function this.
    * exposePosition
	* @param {THREE.Vector3} pointVertice position
	*/
/*	
	this.exposePosition = function( pointVertice ) {

		if ( pointVertice === undefined )
			dotLines.remove();
		else dotLines.dottedLines( pointVertice );

	}
*/
	/**
	* Expose position on axes.
	* @function this.
    * exposePosition
	* @param {THREE.Vector3|object} intersection position or intersection. See {@link https://threejs.org/docs/index.html#api/en/core/Raycaster|Raycaster} for detail.
	*/
	this.exposePosition = function( intersection ) {

		if ( intersection === undefined ) {

			dotLines.remove();
			return;

		}
/*		
		if ( intersection instanceof THREE.Vector3 ) {

//			dotLines.dottedLines( intersection );
			console.error( 'AxesHelper.exposePosition: intersection instanceof THREE.Vector3' );
			return;

		}
*/		
		dotLines.dottedLines( intersection );
//		dotLines.dottedLines( getObjectPosition( intersection.object, intersection.index ) );
/*		
		const position = intersection.object.geometry.attributes.position;
		dotLines.dottedLines( new THREE.Vector3().fromArray( position.array, intersection.index * position.itemSize ) );
*/		

	}
	/**
	 * get THREE
	 * @function this.
	 * getTHREE
	 * @returns {@link https://github.com/anhr/three.js|THREE}
	 */
	this.getTHREE = function() { return THREE; }
	
	/**
	 * get group
	 * @function this.
	 * getGroup
	 * @returns {@link https://threejs.org/docs/index.html#api/en/objects/Group|Group}
	 */
	this.getGroup = function () { return groupAxesHelper; }

	/**
	 * update axes
	 * @function this.
	 * updateAxes
	 */
	this.updateAxes = function() {

		function updateAxis( axisName ) {

			groupAxesHelper.children.forEach( function ( group ) {

				if ( group.userData.axisName !== axisName )
					return;
				groupAxesHelper.remove( group );
				axesHelper.createAxis( axisName );

			} );

		}
		updateAxis( 'x' );
		updateAxis( 'y' );
		updateAxis( 'z' );
		dotLines.update();

	}

}
