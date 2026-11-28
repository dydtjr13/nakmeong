# 피쉬코지 초월+ 시안용 GLB. 직접 모델링한 원본이며 외부 메시는 쓰지 않아요.
# Blender 4.2 headless: blender --background --python build_tx.py
import math
import os
import bpy
import bmesh

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models'))
os.makedirs(OUT, exist_ok=True)

def srgb(r, g, b):
    def f(u):
        return u / 12.92 if u <= 0.04045 else ((u + 0.055) / 1.055) ** 2.4
    return (f(r), f(g), f(b), 1.0)

def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = 'METRIC'
    sc.unit_settings.scale_length = 1.0

def set_input(sock_map, name, value):
    sock = sock_map.get(name)
    if sock is not None:
        sock.default_value = value

def make_mat(name, rgba, metal=0.4, rough=0.35, coat=0.6, coat_r=0.08, emit=0.0, emit_col=None, alpha=1.0, trans=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    ins = {s.name: s for s in bsdf.inputs}
    set_input(ins, 'Base Color', rgba)
    set_input(ins, 'Metallic', metal)
    set_input(ins, 'Roughness', rough)
    set_input(ins, 'Coat Weight', coat)
    set_input(ins, 'Coat Roughness', coat_r)
    set_input(ins, 'Alpha', alpha)
    set_input(ins, 'Transmission Weight', trans)
    if emit > 0:
        set_input(ins, 'Emission Strength', emit)
        set_input(ins, 'Emission Color', emit_col or rgba)
    if alpha < 0.999 or trans > 0:
        if hasattr(m, 'blend_method'):
            m.blend_method = 'BLEND'
        if hasattr(m, 'surface_render_method'):
            m.surface_render_method = 'BLENDED'
    return m

def solo(ob):
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob

def smooth(ob, angle=48):
    solo(ob)
    try:
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle))
    except Exception:
        bpy.ops.object.shade_smooth()

def finish(ob, mat, bevel=0.0, subd=0):
    if ob.data.materials:
        ob.data.materials[0] = mat
    else:
        ob.data.materials.append(mat)
    solo(ob)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if bevel and bevel > 0:
        b = ob.modifiers.new('Bevel', 'BEVEL')
        b.width = bevel
        b.segments = 2
        b.limit_method = 'ANGLE'
        b.angle_limit = math.radians(38)
        bpy.ops.object.modifier_apply(modifier='Bevel')
    if subd:
        s = ob.modifiers.new('Sub', 'SUBSURF')
        s.levels = subd
        s.render_levels = subd
        bpy.ops.object.modifier_apply(modifier='Sub')
    smooth(ob)
    return ob

def box(name, loc, dim, mat, rot=(0, 0, 0), bevel=0.015, subd=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = dim
    return finish(ob, mat, bevel, subd)

def sphere(name, loc, dim, mat, rot=(0, 0, 0), subd=0):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=16, radius=1, location=loc, rotation=rot)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = dim
    return finish(ob, mat, 0, subd)

def cone(name, loc, r, depth, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=r, depth=depth, location=loc, rotation=rot)
    ob = bpy.context.active_object
    ob.name = name
    return finish(ob, mat, r * 0.15, 0)

def empty(name, loc, parent=None):
    e = bpy.data.objects.new(name, None)
    e.empty_display_type = 'PLAIN_AXES'
    e.empty_display_size = 0.08
    e.location = loc
    bpy.context.collection.objects.link(e)
    if parent:
        e.parent = parent
        e.matrix_parent_inverse = parent.matrix_world.inverted()
    return e

def attach(child, parent):
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()

def loft(name, sections, mat, subd=1):
    """sections: (y, half_width, z_bot, z_top). Nose is -Y."""
    bm = bmesh.new()
    n = 22
    rings = []
    for y, hw, zb, zt in sections:
        ring = []
        zc = (zb + zt) * 0.5
        zh = max(0.015, (zt - zb) * 0.5)
        for i in range(n):
            a = i / n * math.tau
            c = math.cos(a)
            s = math.sin(a)
            x = math.copysign(abs(c) ** 0.55, c) * hw
            z = zc + math.copysign(abs(s) ** 0.62, s) * zh
            ring.append(bm.verts.new((x, y, z)))
        rings.append(ring)
    for i in range(len(rings) - 1):
        for j in range(n):
            a = rings[i][j]
            b = rings[i][(j + 1) % n]
            c = rings[i + 1][(j + 1) % n]
            d = rings[i + 1][j]
            try:
                bm.faces.new((a, b, c, d))
            except ValueError:
                pass
    try:
        bm.faces.new(rings[0])
    except ValueError:
        pass
    try:
        bm.faces.new(list(reversed(rings[-1])))
    except ValueError:
        pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return finish(ob, mat, 0.0, subd)

def wheel(name, loc, radius, mats, parent):
    spin = empty(name, loc, parent)
    tire = box(name + '_tire', loc, (radius * 0.22, radius * 0.92, radius * 0.92), mats['rubber'], bevel=radius * 0.12, subd=1)
    # box tire is chunky; replace with torus for a round tire
    bpy.data.objects.remove(tire, do_unlink=True)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=radius * 0.78, minor_radius=radius * 0.2,
        major_segments=28, minor_segments=12,
        location=loc, rotation=(0, math.pi / 2, 0))
    tire = bpy.context.active_object
    tire.name = name + '_tire'
    finish(tire, mats['rubber'], 0, 0)
    attach(tire, spin)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=radius * 0.62, depth=radius * 0.28, location=loc, rotation=(0, math.pi / 2, 0))
    rim = bpy.context.active_object
    rim.name = name + '_rim'
    finish(rim, mats['chrome'], 0.004, 0)
    attach(rim, spin)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=radius * 0.74, minor_radius=radius * 0.035,
        major_segments=28, minor_segments=8,
        location=(loc[0] + radius * 0.02, loc[1], loc[2]), rotation=(0, math.pi / 2, 0))
    lip = bpy.context.active_object
    lip.name = name + '_lip'
    finish(lip, mats['chrome'], 0, 0)
    attach(lip, spin)
    for k in range(7):
        ang = k / 7 * math.tau
        bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=(ang, math.pi / 2, 0))
        sp = bpy.context.active_object
        sp.name = '%s_sp%d' % (name, k)
        sp.scale = (radius * 0.06, radius * 0.08, radius * 0.95)
        finish(sp, mats['chrome'], 0.004, 0)
        attach(sp, spin)
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=radius * 0.16, depth=radius * 0.32, location=loc, rotation=(0, math.pi / 2, 0))
    hub = bpy.context.active_object
    hub.name = name + '_hub'
    finish(hub, mats['light'], 0.002, 0)
    attach(hub, spin)
    return spin

def build():
    clear()
    M = {
        'armor': make_mat('Armor', srgb(0.86, 0.07, 0.08), metal=0.35, rough=0.28, coat=1.0, coat_r=0.06),
        'dark': make_mat('Dark', srgb(0.07, 0.075, 0.09), metal=0.7, rough=0.32, coat=0.85, coat_r=0.08),
        'chrome': make_mat('Chrome', srgb(0.86, 0.88, 0.9), metal=1.0, rough=0.16, coat=0.4, coat_r=0.05),
        'rubber': make_mat('Rubber', srgb(0.08, 0.08, 0.09), metal=0.0, rough=0.72, coat=0.15, coat_r=0.4),
        'glass': make_mat('Glass', srgb(0.62, 0.78, 0.88), metal=0.0, rough=0.04, coat=1.0, coat_r=0.03, alpha=0.45, trans=0.55),
        'light': make_mat('Light', srgb(0.9, 0.96, 1.0), metal=0.0, rough=0.25, coat=0.0, emit=12.0, emit_col=srgb(0.85, 0.95, 1.0)),
        'tail': make_mat('Tail', srgb(1.0, 0.12, 0.16), metal=0.0, rough=0.3, coat=0.0, emit=8.0, emit_col=srgb(1.0, 0.08, 0.1)),
        'glow': make_mat('Glow', srgb(1.0, 0.25, 0.2), metal=0.0, rough=0.4, coat=0.0, emit=4.0, emit_col=srgb(1.0, 0.2, 0.15)),
    }

    root = empty('Rig', (0, 0, 0))
    pelvis = empty('Pelvis', (0, 0, 1.02), root)
    torso = empty('Torso', (0, 0, 1.28), pelvis)
    head = empty('Head', (0, -0.02, 1.98), torso)

    # 골반·허리
    attach(box('pelvis', (0, 0, 1.02), (0.42, 0.32, 0.28), M['dark'], bevel=0.04, subd=1), pelvis)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.22, minor_radius=0.028, location=(0, 0, 1.16), rotation=(math.pi / 2, 0, 0))
    belt = bpy.context.active_object
    belt.name = 'belt'
    finish(belt, M['chrome'], 0, 0)
    attach(belt, pelvis)

    # 몸통 장갑
    attach(box('torso', (0, 0, 1.48), (0.58, 0.36, 0.48), M['armor'], bevel=0.045, subd=1), torso)
    attach(box('chest', (0, -0.16, 1.5), (0.5, 0.08, 0.4), M['armor'], bevel=0.03, subd=1), torso)
    attach(box('chest_dark', (0, -0.12, 1.5), (0.36, 0.04, 0.22), M['dark'], bevel=0.015), torso)
    attach(box('chevL', (-0.1, -0.22, 1.52), (0.34, 0.025, 0.07), M['chrome'], rot=(0, math.radians(34), 0), bevel=0.012), torso)
    attach(box('chevR', (0.1, -0.22, 1.52), (0.34, 0.025, 0.07), M['chrome'], rot=(0, math.radians(-34), 0), bevel=0.012), torso)
    attach(sphere('core', (0, -0.24, 1.42), (0.045, 0.03, 0.055), M['glow']), torso)

    # 헬멧
    attach(sphere('helm', (0, -0.02, 2.02), (0.2, 0.22, 0.2), M['armor'], subd=1), head)
    attach(sphere('face', (0, -0.12, 2.0), (0.12, 0.08, 0.11), M['chrome']), head)
    attach(box('visor', (0, -0.18, 2.02), (0.16, 0.03, 0.045), M['glass'], bevel=0.012), head)
    attach(cone('crestL', (-0.07, 0.0, 2.26), 0.045, 0.32, M['dark'], rot=(math.radians(-8), 0, math.radians(16))), head)
    attach(cone('crestR', (0.07, 0.0, 2.26), 0.045, 0.32, M['dark'], rot=(math.radians(-8), 0, math.radians(-16))), head)
    attach(box('earL', (-0.2, 0.0, 2.02), (0.05, 0.12, 0.14), M['chrome'], bevel=0.015), head)
    attach(box('earR', (0.2, 0.0, 2.02), (0.05, 0.12, 0.14), M['chrome'], bevel=0.015), head)

    def arm(side, sx):
        sh = empty('Shoulder' + side, (sx * 0.4, 0, 1.62), torso)
        attach(sphere('paul' + side, (sx * 0.46, 0, 1.62), (0.2, 0.16, 0.14), M['armor'], subd=1), sh)
        attach(box('paul_rim' + side, (sx * 0.52, 0, 1.62), (0.04, 0.18, 0.16), M['chrome'], bevel=0.01), sh)
        wheel('SpinSh' + side, (sx * 0.66, 0, 1.62), 0.26, M, sh)
        el = empty('Elbow' + side, (sx * 0.52, 0.02, 1.28), sh)
        attach(box('uarm' + side, (sx * 0.5, 0.02, 1.42), (0.14, 0.14, 0.28), M['armor'], bevel=0.03, subd=1), sh)
        attach(sphere('elbow' + side, (sx * 0.52, 0.02, 1.28), (0.07, 0.07, 0.07), M['chrome']), el)
        attach(box('farm' + side, (sx * 0.52, 0.02, 1.08), (0.11, 0.12, 0.26), M['chrome'], bevel=0.025, subd=1), el)
        attach(box('hand' + side, (sx * 0.52, 0.0, 0.88), (0.1, 0.08, 0.12), M['dark'], bevel=0.02), el)
        return sh, el

    def leg(side, sx):
        hip = empty('Hip' + side, (sx * 0.16, 0, 0.92), pelvis)
        knee = empty('Knee' + side, (sx * 0.16, 0.02, 0.52), hip)
        ankle = empty('Ankle' + side, (sx * 0.16, -0.02, 0.16), knee)
        attach(box('thigh' + side, (sx * 0.16, 0, 0.74), (0.18, 0.16, 0.36), M['armor'], bevel=0.03, subd=1), hip)
        attach(box('thigh_s' + side, (sx * 0.08, -0.02, 0.74), (0.06, 0.06, 0.28), M['chrome'], bevel=0.012), hip)
        attach(sphere('knee' + side, (sx * 0.16, 0.02, 0.52), (0.08, 0.08, 0.08), M['chrome']), knee)
        attach(box('shin' + side, (sx * 0.16, 0, 0.34), (0.15, 0.14, 0.32), M['armor'], bevel=0.028, subd=1), knee)
        attach(box('guard' + side, (sx * 0.16, -0.08, 0.36), (0.12, 0.03, 0.16), M['chrome'], bevel=0.01), knee)
        wheel('SpinCf' + side, (sx * 0.36, 0, 0.38), 0.24, M, knee)
        attach(box('foot' + side, (sx * 0.16, -0.08, 0.08), (0.16, 0.32, 0.08), M['armor'], bevel=0.02), ankle)
        attach(box('sole' + side, (sx * 0.16, -0.06, 0.04), (0.18, 0.36, 0.04), M['chrome'], bevel=0.012), ankle)
        return hip, knee

    arm('L', -1)
    arm('R', 1)
    leg('L', -1)
    leg('R', 1)

    # 자동차 (앞 = -Y)
    car = empty('CarRoot', (0, 0, 0), root)
    body = loft('car_body', [
        (-1.62, 0.38, 0.18, 0.34),
        (-1.2, 0.72, 0.15, 0.44),
        (-0.45, 0.88, 0.15, 0.52),
        (0.25, 0.9, 0.17, 0.58),
        (0.95, 0.86, 0.17, 0.5),
        (1.4, 0.68, 0.18, 0.42),
        (1.62, 0.5, 0.2, 0.36),
    ], M['dark'], subd=1)
    attach(body, car)
    hood = loft('car_hood', [
        (-1.5, 0.26, 0.36, 0.44),
        (-1.05, 0.5, 0.46, 0.56),
        (-0.35, 0.52, 0.54, 0.66),
        (0.25, 0.4, 0.56, 0.66),
        (0.7, 0.18, 0.5, 0.58),
    ], M['armor'], subd=1)
    for v in hood.data.vertices:
        v.co.z += 0.025
    attach(hood, car)
    glass = loft('car_glass', [
        (-0.95, 0.42, 0.55, 0.62),
        (-0.45, 0.5, 0.62, 0.86),
        (0.05, 0.46, 0.6, 0.84),
        (0.4, 0.28, 0.55, 0.66),
    ], M['glass'], subd=1)
    attach(glass, car)
    for sx in (-1, 1):
        blade = box('blade%d' % sx, (sx * 0.78, -0.15, 0.4), (0.1, 0.95, 0.16), M['armor'], rot=(0, 0, math.radians(sx * -18)), bevel=0.02, subd=1)
        attach(blade, car)
        lamp = box('lamp%d' % sx, (sx * 0.32, -1.62, 0.36), (0.28, 0.04, 0.045), M['light'], rot=(math.radians(-18), 0, math.radians(sx * 8)), bevel=0.012)
        attach(lamp, car)
        mir = box('mir%d' % sx, (sx * 0.62, -0.35, 0.7), (0.16, 0.06, 0.035), M['chrome'], bevel=0.008)
        attach(mir, car)
    attach(box('tailbar', (0, 1.64, 0.4), (1.25, 0.04, 0.06), M['tail'], bevel=0.01), car)
    attach(box('split', (0, -1.62, 0.16), (1.15, 0.12, 0.035), M['dark'], bevel=0.008), car)
    attach(box('split_lip', (0, -1.68, 0.2), (1.05, 0.03, 0.015), M['chrome'], bevel=0.004), car)
    wing = box('wing', (0, 1.28, 0.78), (1.45, 0.26, 0.045), M['armor'], rot=(math.radians(12), 0, 0), bevel=0.012, subd=1)
    attach(wing, car)
    for sx in (-1, 1):
        attach(box('wing_ep%d' % sx, (sx * 0.7, 1.28, 0.74), (0.04, 0.28, 0.14), M['dark'], bevel=0.008), car)
    for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        wname = 'SpinCar%s%s' % ('F' if sy < 0 else 'R', 'L' if sx < 0 else 'R')
        wheel(wname, (sx * 0.86, sy * 1.02, 0.32), 0.32, M, car)

    # 앞 방향 확인용 (three.js 에서 +Z 인지 봄)
    fwd = empty('Forward', (0, -1.2, 0.4), root)

    # 변신 키: 로봇이 웅크리고 자동차가 커져요
    def key_rot(ob, frame, x=0, y=0, z=0):
        ob.rotation_mode = 'XYZ'
        ob.rotation_euler = (x, y, z)
        ob.keyframe_insert('rotation_euler', frame=frame)

    def key_loc(ob, frame):
        ob.keyframe_insert('location', frame=frame)

    def key_scale(ob, frame, s):
        ob.scale = (s, s, s)
        ob.keyframe_insert('scale', frame=frame)

    # frame 1 stand, 16 crouch, 32 car
    # 팔다리는 축이 뒤집혀 공중제비처럼 보여서, 몸통을 낮추고 자동차가 커지는 전환으로 둡니다.
    key_rot(pelvis, 1, x=math.radians(8))
    key_loc(pelvis, 1)
    key_rot(pelvis, 16, x=math.radians(18))
    pelvis.location = (0, 0.05, 0.72)
    key_loc(pelvis, 16)
    key_rot(pelvis, 32, x=math.radians(8))
    pelvis.location = (0, 0, 0.45)
    key_loc(pelvis, 32)
    key_scale(pelvis, 1, 1)
    key_scale(pelvis, 12, 1)
    key_scale(pelvis, 24, 0.35)
    key_scale(pelvis, 32, 0.001)

    key_scale(car, 1, 0.001)
    key_scale(car, 10, 0.001)
    key_scale(car, 20, 0.72)
    key_scale(car, 32, 1.0)

    sc = bpy.context.scene
    sc.frame_start = 1
    sc.frame_end = 32
    sc.frame_set(1)
    sc.render.fps = 24

    # 폴리곤
    bpy.context.view_layer.update()
    tris = 0
    for ob in bpy.context.scene.objects:
        if ob.type == 'MESH':
            tris += len(ob.data.loop_triangles) if ob.data.loop_triangles else sum(len(p.vertices) - 2 for p in ob.data.polygons)
    # loop_triangles may be empty until calc
    tris = 0
    for ob in bpy.context.scene.objects:
        if ob.type == 'MESH':
            ob.data.calc_loop_triangles()
            tris += len(ob.data.loop_triangles)
    print('TRIS', tris)
    return M

def recolor(M, armor, dark, chrome):
    def put(mat, rgb, emit_col=None):
        bsdf = mat.node_tree.nodes.get('Principled BSDF')
        ins = {s.name: s for s in bsdf.inputs}
        set_input(ins, 'Base Color', srgb(*rgb))
        if emit_col and 'Emission Color' in ins and ins['Emission Strength'].default_value > 0 and mat.name not in ('Light', 'Tail', 'Glow'):
            set_input(ins, 'Emission Color', srgb(*emit_col))
    put(M['armor'], armor)
    put(M['dark'], dark)
    put(M['chrome'], chrome)

def export(path):
    bpy.context.scene.frame_set(1)
    bpy.context.view_layer.update()
    kw = dict(
        filepath=path,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
        export_animations=True,
        export_lights=False,
        export_cameras=False,
        export_skins=False,
    )
    try:
        bpy.ops.export_scene.gltf(**kw, export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6)
        print('EXPORTED_DRACO', path, os.path.getsize(path))
    except Exception as e:
        print('DRACO_FAIL', e)
        bpy.ops.export_scene.gltf(**kw)
        print('EXPORTED', path, os.path.getsize(path))

def main():
    M = build()
    export(os.path.join(OUT, 'tx-crimson.glb'))
    recolor(M, (0.05, 0.55, 0.58), (0.03, 0.12, 0.14), (0.85, 0.95, 0.96))
    export(os.path.join(OUT, 'tx-lake.glb'))
    recolor(M, (0.93, 0.78, 0.42), (0.16, 0.12, 0.08), (0.96, 0.93, 0.84))
    export(os.path.join(OUT, 'tx-aureate.glb'))

if __name__ == '__main__':
    main()
