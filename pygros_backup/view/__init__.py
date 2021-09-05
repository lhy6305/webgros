import copy
from os import path

import cocos
import cocos.actions as cac
import pyglet

from . import data, settings
from ..chart import Line, BaseNote, Drag, Flick, Hold, chart

__all__ = ['preview']

combo_label = None
score_label = None

def play_sound0():
    return pyglet.resource.media('hitsong0.wav').play()
    
def play_sound1():
    return pyglet.resource.media('hitsong1.wav').play()
    
def play_sound2():
    return pyglet.resource.media('hitsong2.wav').play()

def update_labels():
    global combo_label, score_label

    parent = None
    if combo_label is not None:
        parent = combo_label.parent
        combo_label.kill()
    if data.combo > 2:
        text = str(data.combo)
    else:
        text = ''
    combo_label = cocos.text.Label(text, (settings.width / 2, settings.height),
                                   font_name=settings.font_name, font_size=20,
                                   anchor_x='center', anchor_y='top')
    combo_label.add(cocos.text.Label('combo' if data.combo > 2 else '', (0, -30),
                                     font_name=settings.font_name, font_size=15,
                                     anchor_x='center', anchor_y='top'))
    if parent is not None:
        parent.add(combo_label)

    parent = None
    if score_label is not None:
        parent = score_label.parent
        score_label.kill()
    text = str(round(data.score)).zfill(7)
    score_label = cocos.text.Label(text,
                                   (min(settings.width, (settings.width + settings.size) / 2), settings.height),
                                   font_name=settings.font_name, font_size=15,
                                   anchor_x='right', anchor_y='top')
    if parent is not None:
        parent.add(score_label)


def score():
    data.combo += 1
    data.score += 1000000 / data.all_combo
    update_labels()


class NoteExplode(cocos.sprite.Sprite):
    def __init__(self, pos):
        #super().__init__('explode.png', pos)

        def getimg(path):
            img = pyglet.resource.image(path)
            img.anchor_x = img.width/2
            img.anchor_y = img.height/2
            return img

        images = [getimg('gen/anim/0.png'), getimg('gen/anim/1.png'), getimg('gen/anim/2.png'), getimg('gen/anim/3.png'), getimg('gen/anim/4.png'), getimg('gen/anim/5.png'), getimg('gen/anim/6.png'), getimg('gen/anim/7.png'), getimg('gen/anim/8.png'), getimg('gen/anim/9.png'), getimg('gen/anim/10.png'), getimg('gen/anim/11.png'), getimg('gen/anim/12.png'), getimg('gen/anim/13.png'), getimg('gen/anim/14.png'), getimg('gen/anim/15.png'), getimg('gen/anim/16.png'), getimg('gen/anim/17.png'), getimg('gen/anim/18.png'), getimg('gen/anim/19.png'), getimg('gen/anim/20.png'), getimg('gen/anim/21.png'), getimg('gen/anim/22.png'), getimg('gen/anim/23.png'), getimg('gen/anim/24.png'), getimg('gen/anim/25.png'), getimg('gen/anim/26.png'), getimg('gen/anim/27.png'), getimg('gen/anim/28.png'), getimg('gen/anim/29.png')]

        ani = pyglet.image.Animation.from_image_sequence(images, duration=0.020834, loop=False)
        
        super().__init__(ani, pos, rotation=0, scale=1.704545454, opacity=200, color=(255, 245, 160))

        #self.do(cac.ScaleBy(1.3, 0.1) + cac.Delay(0.05) + cac.FadeOut(0.05) + cac.CallFuncS(lambda e: e.kill()))
        #self.do(cac.ScaleBy(1.3, 0.1) + cac.Delay(0.05) + cac.FadeOut(0.05) + cac.CallFuncS(lambda e: e.kill()))
        self.do(cac.Delay(0.2) + cac.FadeOut(0.36) + cac.CallFuncS(lambda e: e.kill()))


class NoteSprite(cocos.sprite.Sprite):
    def __init__(self, note: BaseNote):
        def p(state: BaseNote.NoteState):
            res = copy.copy(state)
            res.pos *= settings.size
            res.speed *= settings.size
            return res

        states = list(map(p, sorted(note.states, key=lambda e: e.sec)))
        dis = 0
        img = 'click.png'
        if isinstance(note, Drag):
            img = 'drag.png'
        elif isinstance(note, Flick):
            img = 'flick.png'
        elif isinstance(note, Hold):
            img = 'hold.png'
            sec = note.tap_sec
            length = 0
            for i in states:
                if i.sec <= note.tap_sec:
                    continue
                length += i.speed * (i.sec - sec)
                sec = i.sec
            length += states[-1].speed * (note.end_sec - sec)
            dis += length // 2
        sec = note.tap_sec
        for i in states[::-1]:
            if i.sec > note.tap_sec:
                break
            note.show_sec = min(
                note.show_sec,
                sec - (settings.size * 2 - abs(dis) + (length if isinstance(note, Hold) else 0)) / abs(i.speed)
            )
            dis += (sec - i.sec) * i.speed
            sec = i.sec
        note.show_sec = min(
            note.show_sec,
            sec - (settings.size * 2 - abs(dis) + (length if isinstance(note, Hold) else 0)) / abs(states[0].speed)
        )
        dis += sec * states[0].speed
        super().__init__(img, (states[0].pos, dis))
        if isinstance(note, Hold):
            self.scale_y = length / self.image.height
        action = cac.Hide()
        sec = 0
        speed = states[0].speed
        for i in states:
            if i.sec > note.tap_sec:
                break
            dis -= (i.sec - sec) * speed
            act = cac.MoveTo((i.pos, dis), i.sec - sec)
            if sec <= note.show_sec < i.sec:
                act |= cac.Delay(note.show_sec - sec) + cac.Show()
            action += act
            sec = i.sec
            speed = i.speed
        act = cac.MoveTo((states[-1].pos, length // 2 if isinstance(note, Hold) else 0), note.tap_sec - sec)
        if sec <= note.show_sec < note.tap_sec:
            act |= cac.Delay(note.show_sec - sec) + cac.Show()
        action += act

        tmp_act = play_sound0
        if isinstance(note, Drag):
            tmp_act = play_sound1
        elif isinstance(note, Flick):
            tmp_act = play_sound2
        elif isinstance(note, Hold):
            tmp_act = play_sound0
        action += cac.CallFunc(tmp_act)
        del tmp_act

        if isinstance(note, Hold):
            class Qwq(cac.IntervalAction):
                def init(self, length, duration, note):
                    self._length = length
                    self.duration = duration
                    self._note = note
                    self._expin = 200 #explode-interval (ms)

                def start(self):
                    self._cur = self.target.scale_y
                    self._lexpt = 0 #last-explode-time
                    self._nexpt = 0 #next-explode-time

                def update(self, t):
                    if round((self._note.end_sec - self._note.tap_sec) * 1000 * t) >= self._nexpt:
                        self.target.parent.add(NoteExplode((self.target.x, 0)))
                        self._lexpt = (round((self._note.end_sec - self._note.tap_sec) * 1000 * t) // self._expin) * self._expin
                        self._nexpt = self._lexpt + self._expin

                    self.target.scale_y = (self._cur - self._length) * (1 - t) + self._length

            nowlen = length // 2
            sec = note.tap_sec
            for i in states:
                if i.sec <= note.tap_sec:
                    continue
                nowlen -= (i.sec - sec) * i.speed
                action += cac.MoveTo((states[-1].pos, nowlen // 2), i.sec - sec) | \
                          Qwq(nowlen / self.image.height, i.sec - sec, note)
                sec = i.sec
            action += cac.MoveTo((states[-1].pos, 0), note.end_sec - sec) | \
                      Qwq(0, note.end_sec - sec, note)

        def explode(e: NoteSprite):
            e.kill()
            e.parent.add(NoteExplode((e.x, e.y)))
            score()

        action += cac.CallFuncS(explode)
        self.do(action)


class LineSprite(cocos.sprite.Sprite):
    def __init__(self, line: Line):

# outdated script below
        class Qwq(cac.IntervalAction):
            def init(self, width, duration):
                self._width = width
                self.duration = duration
            def start(self):
                self._cur = self.target.scale_y
            def update(self, t):
                self.target.scale_y = (self._cur - self._width) * (1 - t) + self._width
# outdated script end

        def p(state: Line.LineState):
            res = copy.copy(state)
            if res.x is None:
                res._prex *= settings.size
                res._prex += (settings.width - settings.size) / 2
            else:
                res.x *= settings.size
                res.x += (settings.width - settings.size) / 2
            if res.y is None:
                res._prey *= settings.size
                res._prey += (settings.height - settings.size) / 2
            else:
                res.y *= settings.size
                res.y += (settings.height - settings.size) / 2
            return res

        states = list(map(p, sorted(line.states, key=lambda e: e.sec)))
        if not (states[0].x is None or states[0].y is None):
            super().__init__('line_empty.png', (states[0].x, states[0].y), states[0].angle)
        else:
            super().__init__('line_empty.png', (states[0]._prex, states[0]._prey), states[0].angle)
        for note in line.notes:
            self.add(NoteSprite(note))
        line_sprite = cocos.sprite.Sprite('line.png')

        self.add(line_sprite)
#        action = None
#        sprite_action = None
        pre = states[0]
        for i in states[1:]:
#            act = cac.MoveTo((i.x, i.y), i.sec - pre.sec) | cac.RotateTo(i.angle - pre.angle, i.sec - pre.sec)
#            if i.rev != pre.rev:
#                act |= cac.Delay(i.sec - pre.sec) + cac.FlipY(duration=0.01)
#            if not action:
#                action = act
#            else:
#                action += act
#            s_act = cac.FadeTo(i.opacity, i.sec - pre.sec)
#            if not sprite_action:
#                sprite_action = s_act
#            else:
#                sprite_action += s_act
            if not (i.x is None or i.y is None):
                self.do(cac.Delay(pre.sec) + (cac.MoveTo((i.x, i.y), i.sec - pre.sec)))
            if not (i.angle is None or pre.angle is None):
                self.do(cac.Delay(pre.sec) + cac.RotateBy(i.angle - pre.angle, i.sec - pre.sec))
            if not (i.opacity is None):
                line_sprite.do(cac.Delay(pre.sec) + cac.FadeTo(i.opacity, i.sec - pre.sec))
            
            pre = i

#        if action:
#            self.do(action)
#        if sprite_action:
#            line_sprite.do(sprite_action)

# outdated script below
        action = None
        sec = 0
        for i in states:
            if i.width is None:
                act = Qwq(1, i.sec - sec)
            else:
                act = Qwq(i.width, i.sec - sec)
            if not action:
                action = act
            else:
                action += act
            sec = i.sec
        if action:
            line_sprite.do(action)
# outdated script end


class Player(cocos.layer.Layer):
    def __init__(self):
        super().__init__()
        if settings.background is not None:
            back = cocos.sprite.Sprite(settings.background, (settings.width / 2, settings.height / 2))
            back.opacity = settings.opacity
            back.scale = settings.height / back.image.height
            self.add(back)
        for line in chart.lines:
            self.add(LineSprite(line))
        update_labels()
        self.add(combo_label)
        self.add(score_label)
        self.add(cocos.text.Label(settings.name,
                                  (max(0, (settings.width - settings.size) / 2), 0),
                                  font_name=settings.font_name, font_size=15,
                                  anchor_x='left', anchor_y='bottom'))
        self.add(cocos.text.Label(settings.diff,
                                  (min(settings.width, (settings.width + settings.size) / 2), 0),
                                  font_name=settings.font_name, font_size=15,
                                  anchor_x='right', anchor_y='bottom'))
        if settings.music is not None:
            pyglet.resource.media(settings.music).play()


def preview(
        name='test',
        diff='EZ Lv.0',
        music=None,
        background=None,
        *,
        height=600,
        width=800,
        size=600,
        opacity=127,
        font_name=['Electrolize'],
):
    settings.name = name
    settings.diff = diff
    settings.music = music
    settings.background = background
    settings.height = height
    settings.width = width
    settings.size = size
    settings.opacity = opacity
    settings.font_name = font_name
    data.all_combo = len(chart.notes)
    pyglet.resource.path.extend([path.join(path.dirname(__file__), 'resources')])
    pyglet.resource.reindex()
    pyglet.resource.add_font('electrolize.ttf')
    cocos.director.director.init(width=width, height=height)
    main_scene = cocos.scene.Scene(Player())
    #cocos.director.director.show_FPS = True
    cocos.director.director.run(main_scene)
