from base_player import BasePlayer

class Gunslinger(BasePlayer):
  def __init__(self, **kwargs):
    super(Gunslinger, self).__init__(kwargs)
    self.inventory.extend(['revolver', 'rifle', 'bullets', 'knife'])
    self.is_hunter = True
    self.can_fillet = True
