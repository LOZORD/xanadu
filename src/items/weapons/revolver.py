from gun import Gun
from revolver_bullet import RevolverBullet

class Revolver(Gun):
  def __init__(self, init_rounds=6):
    self.rounds = init_rounds
    super(Revolver, self).__init__(RevolverBullet, clip_size=6, bullet_range=10)
