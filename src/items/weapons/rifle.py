from gun import Gun
from rifle_bullet import RifleBullet

class Rifle(Gun):
  def __init__(self, init_rounds=20):
    self.rounds = init_rounds
    super(self, Rifle).__init__(RifleBullet, clip_size=10, bullet_range=25)

