import vt from '../glsl/hokan.vert';
import fg from '../glsl/hokan.frag';
import { MyObject3D } from '../webgl/myObject3D';
import { BaseItem } from './baseItem';
import { Color, Mesh, PlaneGeometry, ShaderMaterial, SplineCurve, Texture, Vector2 } from 'three';
import { Util } from '../libs/util';
import { Func } from '../core/func';
import { Conf } from '../core/conf';
// import { MousePointer } from '../core/mousePointer';

export class SpringItem extends MyObject3D {

  private _id: number
  private _mat: ShaderMaterial;
  private _left: BaseItem
  private _right: BaseItem
  private _hokan: Array<Mesh> = []
  private _hokanSize: number = 0.001

  constructor(id:number, t: Texture, color: Color) {
    super();

    // this._c = Util.randomInt(0, 1000)
    this._c = id * 10
    this._id = id

    this._left = new BaseItem(new Vector2(0.5, 1), t, color);
    this.add(this._left);

    this._right = new BaseItem(new Vector2(0, 0.5), t, color);
    this.add(this._right);

    const geo = new PlaneGeometry(1, this._hokanSize)
    this._mat = new ShaderMaterial({
      vertexShader: vt,
      fragmentShader: fg,
      transparent: true,
      depthTest: false,
      uniforms: {
        t: { value: t },
        center: { value: new Vector2(0.5, 0) },
        time: { value: 0 },
        col: { value: 0 },
        color: { value: color },
      },
    })

    const num = 100
    for(let i = 0; i < num; i++) {
      const hokan = new Mesh(geo, this._mat)
      this.add(hokan)
      this._hokan.push(hokan)
    }
  }

  protected _update():void {
    super._update();

    const sw = Func.sw();
    const sh = Func.sh();
    // const size = (sw / Conf.instance.ITEM_NUM) * 0.5
    const size = Math.max(sw, sh) * 0.3

    this.position.x = (sw / Conf.instance.ITEM_NUM) * 1 * this._id - ((sw / Conf.instance.ITEM_NUM) * 1) * (Conf.instance.ITEM_NUM - 1) * 0.5

    // const mx = MousePointer.instance.easeNormal.x
    // const my = MousePointer.instance.easeNormal.y

    this._left.scale.set(size, size, 1)
    this._right.scale.set(size, size, 1)

    const wave = Util.map(Math.sin(this._c * 0.01), -0.5, 0.5, -1, 1) * 0
    this._left.setMask(new Vector2(0.5 + wave, 1))
    this._right.setMask(new Vector2(0, 0.5 + wave))

    this._mat.uniforms.center.value.y = 0.5
    this._mat.uniforms.time.value += Conf.instance.SPEED
    this._mat.uniforms.col.value = 1
    this._left.updateUni()
    this._right.updateUni()

    const allRadius = Math.min(sw, sh) * 0.05 * Util.map(Math.sin(this._c * 0.01), 0, 3, -1, 1)

    const ang = this._c * Util.map(this._id, 1, 1, 0, Conf.instance.ITEM_NUM - 1)
    // const ang = this._c
    const radianA = Util.radian(ang)
    const radianB = Util.radian(ang + 180 * Util.map(Math.sin(this._c * 0.03), 0, 1, -1, 1))
    // const radianB = Util.radian(ang + 180)

    this._left.position.x = Math.sin(radianA) * allRadius
    this._left.position.y = Math.cos(radianA) * allRadius
    // this._left.rotation.z = Util.radian(Util.degree(Math.atan2(this._left.position.y, this._left.position.x)) - 90)

    this._right.position.x = Math.sin(radianB) * allRadius
    this._right.position.y = Math.cos(radianB) * allRadius
    // this._right.rotation.z = Util.radian(Util.degree(Math.atan2(this._right.position.y, this._right.position.x)) + 90)
    // this._right.visible = false

    const hokanHeight = size * 0.05

    const curveArr: Array<Vector2> = []

    curveArr.push(new Vector2(this._left.position.x, this._left.position.y - hokanHeight * 0))
    curveArr.push(new Vector2(Math.sin(-radianA) * allRadius * 0.5, Math.cos(-radianA) * allRadius * 0.5))
    // curveArr.push(new Vector2(Math.sin(-radianA) * allRadius * mx * 0.5, Math.cos(-radianA) * allRadius * my * -0.5))
    curveArr.push(new Vector2(this._right.position.x, this._right.position.y + hokanHeight * 0))

    const curve = new SplineCurve(curveArr)
    const points = curve.getPoints(this._hokan.length - 1)


    this._hokan.forEach((hokan, i) => {
      hokan.scale.set(size * -1, size * 1, 1)

      const p = points[i]
      if(p != undefined) {
        hokan.position.x = p.x
        hokan.position.y = p.y

        const next = i != 0 ? points[i - 1] : new Vector2(this._left.position.x, this._left.position.y)
        const dx = next.x - p.x
        const dy = next.y - p.y
        hokan.rotation.z = Util.radian(Util.degree(Math.atan2(dy, dx)) + 90)

        if(i === 0) {
          this._left.position.x = p.x
          this._left.position.y = p.y
          // this._left.rotation.z = Util.radian(Util.degree(hokan.rotation.z) + 180)
          hokan.visible = false
        }

        if(i === this._hokan.length - 1) {
          this._right.position.x = p.x
          this._right.position.y = p.y
          this._right.rotation.z = Util.radian(Util.degree(hokan.rotation.z) + 180)
          hokan.visible = false
        }
      }

      this._left.rotation.z = Util.radian(Util.degree(this._hokan[1].rotation.z) + 0)
    })
  }
}