from repairable_item import RepairableItem

class BaseWeapon(RepairableItem):
  def __init__(self, damage=1):
    self.damage = damage

  def attack(self, other):
    pass
