from base_weapon import BaseWeapon

class Gun(BaseWeapon):
  def __init__(self, bullet_type, clip_size=1, bullet_range=1, speed=1):
    self.bullet_type = bullet_type
    self.clip_size = clip_size
    self.bullet_range = bullet_range
    self.speed = speed

  def shoot(self, direction):
    pass
