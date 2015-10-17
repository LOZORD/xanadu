from base_player import BasePlayer

class Gunslinger(BasePlayer):
  super(Gunslinger, self).__init__()
  self.inventory.extend(['revolver', 'rifle', 'bullets', 'knife'])
  self.is_hunter = True
  self.can_fillet = True
