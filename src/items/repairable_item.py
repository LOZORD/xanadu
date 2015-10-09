from equippable_item import EquippableItem
class RepairableItem(EquippableItem):
  def __init__(self, item_health):
    super(RepairableItem, self).__init__()
    self.max_health   = item_health
    self.curr_health  = item_health

  def damage(self, damage_amount):
    self.curr_health -= damage_amount
    return self.curr_health

  def repair(self, repair_percent):
    self.curr_health = self.max_health * repair_percent
    return self.curr_health
